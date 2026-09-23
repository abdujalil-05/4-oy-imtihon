// Nest dan parametr dekoratori yaratish uchun kerakli vositalar
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

// Cookie ichidagi refresh tokenni qaytaruvchi dekorator
export const RefreshToken = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    // So'rov obyektini olamiz
    const req = ctx.switchToHttp().getRequest();
    // Cookie dan refresh tokenni olamiz
    const refreshToken = req.cookies?.refreshToken;
    // Token bo'lmasa so'rovni to'xtatamiz
    if (!refreshToken) {
      throw new UnauthorizedException('Tizimga kirishda nosozlik');
    }
    // Tokenni qaytaramiz
    return refreshToken;
  },
);
