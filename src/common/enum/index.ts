// Rollar — Prisma enum bilan bir xil qiymatlar
export enum Roles {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

// Qurilma yopilish sabablari — Prisma enum bilan bir xil
export enum RevokeReason {
  LOGOUT = 'LOGOUT',
  LOGOUT_ALL = 'LOGOUT_ALL',
  REVOKED_BY_USER = 'REVOKED_BY_USER',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  REUSE_DETECTED = 'REUSE_DETECTED',
  ADMIN_REVOKED = 'ADMIN_REVOKED',
}
