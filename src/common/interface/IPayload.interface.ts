// Token ichida saqlanadigan ma'lumotlar ko'rinishi
export interface IPayload {
  // Foydalanuvchining raqami
  sub: number;
  // Foydalanuvchining roli
  role: string;
  // Foydalanuvchining holati
  status: string;
  // Foydalanuvchi kirgan qurilma raqami
  deviceId: number;
}
