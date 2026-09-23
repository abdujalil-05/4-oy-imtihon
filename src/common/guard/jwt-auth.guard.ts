// Guard yozish uchun kerakli Nest vositalari
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
// Token bilan ishlovchi yordamchi klass
import { Token } from '../../infrastructure/lib/Token';

// Foydalanuvchi tizimga kirganini tekshiruvchi guard
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    // So'rov obyektini olamiz
    const req = context.switchToHttp().getRequest();
    // Cookie dan access tokenni olamiz
    const accessToken = req.cookies?.accessToken;
    // Token bo'lmasa kiritmaymiz
    if (!accessToken) {
      throw new UnauthorizedException('Tizimga kirishda nosozlik');
    }
    // Tokenni tekshirib ichidagi ma'lumotni olamiz
    const data = await Token.verifyToken(accessToken, 'access');
    // Ma'lumot bo'lmasa kiritmaymiz
    if (!data) {
      throw new UnauthorizedException('Tizimga kirishda nosozlik');
    }
    // Keyingi qatlamlar uchun foydalanuvchini so'rovga yozamiz
    req.user = {
      sub: data.sub,
      role: data.role,
      status: data.status,
      deviceId: data.deviceId,
    };
    // Ruxsat beramiz
    return true;
  }
}
