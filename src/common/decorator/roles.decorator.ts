import { SetMetadata } from '@nestjs/common'; // Metama'lumot

export const ROLES_KEY = 'roles'; // Kalit

// @AccessRoles(Roles.ADMIN, ...) — ruxsat etilgan rollar (TZ 9.4)
export const AccessRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);
