import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'; // Guard
import { Reflector } from '@nestjs/core'; // Metama'lumot
import { ROLES_KEY } from '../decorator/roles.decorator'; // @AccessRoles kaliti
import { IS_PUBLIC_KEY } from '../decorator/public.decorator'; // @Public kaliti

// Global rol guard (TZ 9.5)
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // @Public bo'lsa — req.user yo'q, tekshirish ma'nosiz
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // @AccessRoles ro'yxati (handler ustun, keyin class)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // @AccessRoles yo'q — autentifikatsiya yetarli
    }
    const req = context.switchToHttp().getRequest(); // So'rov
    const user = req.user; // AuthGuard yozgan
    if (!user) {
      throw new ForbiddenException('Foydalanuvchi topilmadi');
    }
    const hasRole = requiredRoles.includes(user.role); // Rol ro'yxatdami?
    if (!hasRole) {
      throw new ForbiddenException("Bu amal uchun ruxsatingiz yo'q"); // 403
    }
    return true;
  }
}
