import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'; // Parametr decorator
import { IUser } from '../interface/IUser.interface'; // req.user tipi

// @UserId() — faqat foydalanuvchi ID
export const UserId = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest(); // So'rov
    const userId = req.user?.sub; // AuthGuard yozgan
    if (!userId) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }
    return Number(userId);
  },
);

// @CurrentUser() — butun req.user (sub, role, deviceId) — TZ 9.6
export const CurrentUser = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext): IUser => {
    const req = ctx.switchToHttp().getRequest(); // So'rov
    if (!req.user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }
    return req.user;
  },
);
