// Kerakli xato turlari
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
// Baza bilan ishlovchi xizmat
import { PrismaService } from '../../config/database/prisma.service';
// Tizimga kirish ma'lumoti
import { SignInDto } from './dto/sign-in.dto';
// Parol bilan ishlovchi klass
import { Crypt } from '../../infrastructure/lib/Crypt';
// Bir xil javob qaytaruvchi funksiya
import { successRes } from '../../common/helper/success-response';
// Token bilan ishlovchi klass
import { Token } from '../../infrastructure/lib/Token';
// Express so'rov va javob turlari
import type { Response, Request } from 'express';
// Qurilma ma'lumotini oluvchi funksiya
import { getDeviceInfo } from '../../common/helper/device-info';
// Holatlar ro'yxati
import { Status } from '../../common/enum';

// Tizimga kirish bilan ishlovchi xizmat
@Injectable()
export class AuthService {
  constructor(private readonly db: PrismaService) {}

  async signIn(dto: SignInDto, req: Request, res: Response) {
    // Login bo'yicha foydalanuvchini qidiramiz
    const user = await this.db.user.findUnique({
      where: { login: dto.login },
    });
    // Parolni shifrlangan parol bilan solishtiramiz
    const isMatchPass = await Crypt.compare(
      dto.password,
      user ? user.hashedPassword : '',
    );
    // Login yoki parol xato bo'lsa kiritmaymiz
    if (!isMatchPass || !user) {
      throw new BadRequestException('Login yoki parol xato');
    }
    // Foydalanuvchi nofaol bo'lsa kiritmaymiz
    if (user.status === Status.INACTIVE) {
      throw new ForbiddenException('Foydalanuvchi bloklangan');
    }
    // Foydalanuvchining qurilmalarini olamiz
    const devices = await this.db.devices.findMany({
      where: { userId: user.id },
    });
    // Qurilmalar soni chegaradan oshsa kiritmaymiz
    if (devices.length >= 2) {
      throw new ForbiddenException(
        'Qurilmalar soni 2 tadan oshishi taqiqlanadi',
      );
    }
    // So'rovdan qurilma ma'lumotini olamiz
    const { client, os } = getDeviceInfo(req);
    // Yangi qurilmani bazaga yozamiz
    const device = await this.db.devices.create({
      data: {
        user: { connect: { id: user.id } },
        device: `${client?.name} ${os?.name ? os.name : 'unknown'}`,
        hashedRefreshToken: '',
      },
    });
    // Token ichiga yoziladigan ma'lumotni yig'amiz
    const payload = {
      sub: user.id,
      role: user.role,
      status: user.status,
      deviceId: device.deviceId,
    };
    // Tokenlarni yasaymiz
    const { accessToken, refreshToken } = await Token.getToken(payload);
    // Refresh tokenni shifrlaymiz
    const hashedRefreshToken = await Crypt.hash(refreshToken);
    // Shifrlangan tokenni qurilmaga yozamiz
    await this.db.devices.update({
      where: { deviceId: device.deviceId },
      data: {
        hashedRefreshToken,
      },
    });
    // Tokenlarni cookie ga yozamiz
    Token.setCookie(res, accessToken, refreshToken);
    // Qurilma haqidagi ma'lumotni qaytaramiz
    return successRes(
      {
        userId: device.userId,
        deviceId: device.deviceId,
        device: device.device,
        createdAt: device.createdAt,
      },
      201,
    );
  }

  async refreshToken(refreshToken: string, res: Response) {
    // Refresh tokenni tekshiramiz
    const verifiedData = await Token.verifyToken(refreshToken, 'refresh');
    // Tokendagi qurilmani bazadan qidiramiz
    const device = await this.db.devices.findUnique({
      where: {
        deviceId: verifiedData.deviceId,
        userId: verifiedData.sub,
      },
    });
    // Qurilma topilmasa xato qaytaramiz
    if (!device) {
      throw new BadRequestException(
        'Tizimda bunday foydalanuvchi yoki qurilma topilmadi',
      );
    }
    // Tokenni qurilmadagi shifrlangan token bilan solishtiramiz
    const isMatchToken = await Crypt.compare(
      refreshToken,
      device.hashedRefreshToken,
    );
    // Token mos kelmasa xato qaytaramiz
    if (!isMatchToken) {
      throw new BadRequestException("Qurilma tizimda ro'yxatdan o'tmagan");
    }
    // Eski vaqt maydonlarini olib tashlaymiz
    delete verifiedData.iat;
    delete verifiedData.exp;
    // Yangi access tokenni yasaymiz
    const { accessToken } = await Token.getToken(verifiedData);
    // Yangi tokenni cookie ga yozamiz
    Token.setCookie(res, accessToken);
    // Qurilma haqidagi ma'lumotni qaytaramiz
    return successRes(
      {
        userId: device.userId,
        deviceId: device.deviceId,
        device: device.device,
        createdAt: device.createdAt,
      },
      201,
    );
  }

  async signOut(refreshToken: string, res: Response) {
    // Refresh tokenni tekshiramiz
    const verifiedData = await Token.verifyToken(refreshToken, 'refresh');
    // Qurilmani bazadan o'chiramiz
    await this.db.devices.delete({
      where: {
        deviceId: verifiedData.deviceId,
        userId: verifiedData.sub,
      },
    });
    // Cookie dagi tokenlarni tozalaymiz
    Token.clearCookie(res);
    // Bo'sh javob qaytaramiz
    return successRes({});
  }

  async findMe(userId: number) {
    // Foydalanuvchining o'z ma'lumotini olamiz
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        login: true,
        fullName: true,
        phone: true,
        imageUrl: true,
        role: true,
        status: true,
      },
    });
    // Ma'lumotni qaytaramiz
    return successRes(user ? user : {});
  }
}
