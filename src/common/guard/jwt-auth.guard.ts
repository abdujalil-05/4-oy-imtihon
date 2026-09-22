import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'; // Guard
import { Reflector } from '@nestjs/core'; // Metama'lumot o'qish
import { Token } from '../../infrastructure/lib/Token'; // Token tekshirish
import { PrismaService } from '../../config/database/prisma.service'; // Baza
import { IS_PUBLIC_KEY } from '../decorator/public.decorator'; // @Public kaliti

// Global auth guard: @Public bo'lsa o'tkazadi, aks holda token + qurilma + foydalanuvchi tekshiradi (TZ 8.2)
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, // Metama'lumot
    private readonly db: PrismaService, // Baza
  ) {}

  async canActivate(context: ExecutionContext) {
    // @Public handler yoki class darajasida bormi?
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true; // Ochiq endpoint

    const req = context.switchToHttp().getRequest(); // So'rov
    const [type, accessToken] = req.headers.authorization?.split(' ') ?? []; // "Bearer <token>"
    if (type !== 'Bearer' || !accessToken) {
      throw new UnauthorizedException('Avtorizatsiya talab qilinadi'); // Token yo'q
    }

    const data = await Token.verifyAccessToken(accessToken); // Imzo + muddat (xato → 401)

    // Qurilmani foydalanuvchi bilan birga bitta so'rovda olamiz
    const device = await this.db.devices.findUnique({
      where: { deviceId: data.deviceId },
      include: { user: { select: { id: true, role: true, isActive: true } } },
    });

    // Qurilma yo'q / yopilgan / muddati o'tgan / boshqa odamniki / foydalanuvchi bloklangan → 401
    if (
      !device ||
      device.revokedAt ||
      device.expiresAt <= new Date() ||
      device.userId !== data.sub ||
      !device.user.isActive
    ) {
      throw new UnauthorizedException('Sessiya tugagan. Qayta kiring');
    }

    // req.user — rol BAZADAN (Admin o'zgartirsa darhol kuchga kiradi)
    req.user = {
      sub: device.userId,
      role: device.user.role,
      deviceId: device.deviceId,
    };
    return true;
  }
}
