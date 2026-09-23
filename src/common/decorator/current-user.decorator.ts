// Nest dan parametr dekoratori yaratish uchun kerakli vositalar
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

// Tokendan olingan foydalanuvchi raqamini qaytaruvchi dekorator
export const UserId = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    // So'rov obyektini olamiz
    const req = ctx.switchToHttp().getRequest();
    // Guard qo'ygan foydalanuvchi raqamini olamiz
    const userId = req.user?.sub;
    // Agar raqam bo'lmasa so'rovni to'xtatamiz
    if (!userId) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }
    // Raqam ko'rinishida qaytaramiz
    return Number(userId);
  },
);
