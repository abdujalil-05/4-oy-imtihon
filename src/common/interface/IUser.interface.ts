import { Roles } from '../enum'; // Rollar

// req.user — AuthGuard yozadi (TZ 9.3)
export interface IUser {
  sub: number; // Foydalanuvchi ID (tokendan)
  role: Roles; // Rol (BAZADAN)
  deviceId: string; // Qurilma ID (tokendan)
}
