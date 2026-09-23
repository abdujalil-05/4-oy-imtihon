// Metadata yozish uchun Nest vositasi
import { SetMetadata } from '@nestjs/common';

// Metadata saqlanadigan kalit nomi
export const ROLES_KEY = 'roles';

// Endpointga ruxsat etilgan rollarni belgilovchi dekorator
export const AccessRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);
