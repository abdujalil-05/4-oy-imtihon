// Guard yozish uchun kerakli Nest vositalari
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
// Metadata o'qish uchun vosita
import { Reflector } from '@nestjs/core';
// Rollar metadata kaliti
import { ROLES_KEY } from '../decorator/roles.decorator';
// Rollar ro'yxati
import { Roles } from '../enum';

// Foydalanuvchining roli mos kelishini tekshiruvchi guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Endpointga qo'yilgan rollarni o'qiymiz
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // Rol belgilanmagan bo'lsa hammaga ruxsat
    if (!requiredRoles) {
      return true;
    }
    // So'rov obyektini olamiz
    const req = context.switchToHttp().getRequest();
    // Guard yozib qo'ygan foydalanuvchini olamiz
    const user = req.user;
    // Foydalanuvchi bo'lmasa ruxsat bermaymiz
    if (!user) {
      throw new ForbiddenException('Foydalanuvchi topilmadi');
    }
    // Superadmin barcha endpointlarga kira oladi
    if (user.role === Roles.SUPERADMIN) {
      return true;
    }
    // Foydalanuvchi o'zining ma'lumotiga murojaat qilsa ruxsat beramiz
    if (requiredRoles.includes('ID') && req.params?.id == user.sub) {
      return true;
    }
    // Foydalanuvchining roli ruxsat etilganlar ichida bormi
    const hasRole = requiredRoles.includes(user.role);
    // Rol mos kelmasa so'rovni to'xtatamiz
    if (!hasRole) {
      throw new ForbiddenException('Ruxsat etilmagan foydalanuvchi');
    }
    // Ruxsat beramiz
    return true;
  }
}
