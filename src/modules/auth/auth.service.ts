import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';
import { SignInDto } from './dto/sign-in.dto';
import { Crypt } from '../../infrastructure/lib/Crypt';
import { successRes } from '../../common/helper/success-response';
import { Token } from '../../infrastructure/lib/Token';
import type { Response, Request } from 'express';
import { getDeviceInfo } from '../../common/helper/device-info';
import { Status } from '../../common/enum';

@Injectable()
export class AuthService {
  constructor(private readonly db: PrismaService) {}

  async signIn(dto: SignInDto, req: Request, res: Response) {
    const user = await this.db.user.findUnique({
      where: { login: dto.login },
    });
    const isMatchPass = await Crypt.compare(
      dto.password,
      user ? user.hashedPassword : '',
    );
    if (!isMatchPass || !user) {
      throw new BadRequestException('Login yoki parol xato');
    }
    if (user.status === Status.INACTIVE) {
      throw new ForbiddenException('Foydalanuvchi bloklangan');
    }
    const { client, os } = getDeviceInfo(req);
    const device = await this.db.devices.create({
      data: {
        user: { connect: { id: user.id } },
        device: `${client?.name} ${os?.name ? os.name : 'unknown'}`,
        hashedRefreshToken: '',
      },
    });
    const payload = {
      sub: user.id,
      role: user.role,
      status: user.status,
      deviceId: device.deviceId,
    };
    const { accessToken, refreshToken } = await Token.getToken(payload);
    const hashedRefreshToken = await Crypt.hash(refreshToken);
    await this.db.devices.update({
      where: { deviceId: device.deviceId },
      data: {
        hashedRefreshToken,
      },
    });
    Token.setCookie(res, accessToken, refreshToken);
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
    const verifiedData = await Token.verifyToken(refreshToken, 'refresh');
    const device = await this.db.devices.findUnique({
      where: {
        deviceId: verifiedData.deviceId,
        userId: verifiedData.sub,
      },
    });
    if (!device) {
      throw new BadRequestException(
        'Tizimda bunday foydalanuvchi yoki qurilma topilmadi',
      );
    }
    const isMatchToken = await Crypt.compare(
      refreshToken,
      device.hashedRefreshToken,
    );
    if (!isMatchToken) {
      throw new BadRequestException("Qurilma tizimda ro'yxatdan o'tmagan");
    }
    delete verifiedData.iat;
    delete verifiedData.exp;
    const { accessToken } = await Token.getToken(verifiedData);
    Token.setCookie(res, accessToken);
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
    const verifiedData = await Token.verifyToken(refreshToken, 'refresh');
    await this.db.devices.delete({
      where: {
        deviceId: verifiedData.deviceId,
        userId: verifiedData.sub,
      },
    });
    Token.clearCookie(res);
    return successRes({});
  }

  async findMe(userId: number) {
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
    return successRes(user ? user : {});
  }
}
