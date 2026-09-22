// Access token ichidagi ma'lumot (TZ 5.1)
export interface IPayload {
  sub: number; // Foydalanuvchi ID
  role: string; // Rol (ma'lumot uchun — haqiqiy rol bazadan)
  deviceId: string; // Qurilma (sessiya) ID
}
