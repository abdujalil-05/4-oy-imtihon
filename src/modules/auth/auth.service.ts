import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'; // Xatolar
import type { Request } from 'express'; // So'rov tipi
import { PrismaService } from '../../config/database/prisma.service'; // Baza
import { Crypt } from '../../infrastructure/lib/Crypt'; // Parol
import { Token } from '../../infrastructure/lib/Token'; // Tokenlar
import { successRes } from '../../common/helper/success-response'; // Javob
import { RevokeReason } from '../../common/enum'; // Sabablar
import { env } from '../../config'; // Sozlamalar
import { IUser } from '../../common/interface/IUser.interface'; // req.user
import { DeviceService } from './device.service'; // Qurilmalar
import { SignInDto } from './dto/sign-in.dto'; // DTO

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService, // Baza
    private readonly device: DeviceService, // Qurilmalar
  ) {}

  // LOGIN (TZ 8.1)
  async signIn(dto: SignInDto, req: Request) {
    const user = await this.db.user.findUnique({
      where: { login: dto.login.toLowerCase() }, // Kichik harfga
    });

    // Topilmasa ham bcrypt ishlaydi (vaqt tengligi) — xabar bir xil
    const isMatchPass = await Crypt.compare(
      dto.password,
      user
        ? user.hashedPassword
        : '',
    );
    if (!user || !isMatchPass) {
      throw new UnauthorizedException("Login yoki parol noto'g'ri");
    }

    // Vaqtinchalik blok — parol tekshiruvidan OLDIN
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      ); // Qoldi
      throw new HttpException(
        `Juda ko'p urinish. ${minutes} daqiqadan keyin qayta urinib ko'ring`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Parol xato — hisoblagich, limitda blok
    if (!isMatchPass) {
      const failed = user.failedLoginCount + 1; // +1
      await this.db.user.update({
        where: { id: user.id },
        data:
          failed >= env.AUTH.MAX_ATTEMPTS
            ? {
                failedLoginCount: 0,
                lockedUntil: new Date(
                  Date.now() + env.AUTH.LOCK_MINUTES * 60000,
                ),
              } // Blok
            : { failedLoginCount: failed }, // Faqat +1
      });
      throw new UnauthorizedException("Login yoki parol noto'g'ri");
    }

    // Admin bloki — parol tekshiruvidan KEYIN
    if (!user.isActive) {
      throw new ForbiddenException(
        'Hisob bloklangan. Administratorga murojaat qiling',
      );
    }

    // Muvaffaqiyat — hisoblagich 0, oxirgi kirish
    await this.db.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    // Qurilma (sessiya) yaratish — limit ichida
    const { deviceId, refreshToken } = await this.device.create(
      user.id,
      req,
      dto.deviceName,
    );

    // Access token: sub, role, deviceId
    const accessToken = await Token.getAccessToken({
      sub: user.id,
      role: user.role,
      deviceId,
    });

    return successRes({
      accessToken,
      refreshToken,
      accessTokenExpiresIn: Token.accessTtlSeconds(),
      user: {
        id: user.id,
        login: user.login,
        fullName: user.fullName,
        role: user.role,
      },
    });
  }

  // REFRESH (TZ 8.3)
  async refreshToken(refreshToken: string, req: Request) {
    const rotated = await this.device.rotate(refreshToken, req.ip); // Rotatsiya + reuse
    if (!rotated) {
      throw new UnauthorizedException('Sessiya tugagan. Qayta kiring'); // Umumiy xabar
    }
    const user = await this.db.user.findUnique({
      where: { id: rotated.userId },
    }); // Rol uchun
    if (!user) {
      throw new UnauthorizedException('Sessiya tugagan. Qayta kiring');
    }
    const accessToken = await Token.getAccessToken({
      sub: user.id,
      role: user.role,
      deviceId: rotated.deviceId, // O'sha qurilma
    });
    return successRes({
      accessToken,
      refreshToken: rotated.refreshToken,
      accessTokenExpiresIn: Token.accessTtlSeconds(),
    });
  }

  // LOGOUT — joriy qurilma (TZ 8.4), deviceId tokendan
  async signOut(user: IUser) {
    await this.device.revoke(user.deviceId, RevokeReason.LOGOUT);
    return successRes({});
  }

  // LOGOUT-ALL (TZ 8.5)
  async signOutAll(user: IUser) {
    await this.device.revokeAll(user.sub, RevokeReason.LOGOUT_ALL);
    return successRes({});
  }

  // ME (TZ 8.6) — xeshsiz
  async me(user: IUser) {
    const data = await this.db.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        login: true,
        fullName: true,
        role: true,
        lastLoginAt: true,
      },
    });
    if (!data) {
      throw new UnauthorizedException('Sessiya tugagan. Qayta kiring');
    }
    return successRes(data);
  }

  // PAROLNI O'ZGARTIRISH (TZ 8.9)
  async changePassword(
    user: IUser,
    currentPassword: string,
    newPassword: string,
  ) {
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'Yangi parol joriy paroldan farq qilishi kerak',
      );
    }
    const found = await this.db.user.findUnique({ where: { id: user.sub } }); // Xesh bilan
    if (!found) {
      throw new UnauthorizedException('Sessiya tugagan. Qayta kiring');
    }
    const isMatchPass = await Crypt.compare(
      currentPassword,
      found.hashedPassword,
    ); // Joriy parol
    if (!isMatchPass) {
      throw new BadRequestException("Joriy parol noto'g'ri"); // 400 — foydalanuvchi tanilgan
    }
    const hashedPassword = await Crypt.hash(newPassword); // Yangi xesh
    // Tranzaksiya: xesh + joriydan boshqa qurilmalar yopiladi
    await this.db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: found.id },
        data: { hashedPassword },
      });
      await this.device.revokeAll(
        found.id,
        RevokeReason.PASSWORD_CHANGED,
        tx,
        user.deviceId,
      );
    });
    return successRes({});
  }
}
