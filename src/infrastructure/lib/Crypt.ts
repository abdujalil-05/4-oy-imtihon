// Parolni shifrlovchi paket
import bcrypt from 'bcrypt';

// Parol bilan ishlovchi yordamchi klass
export class Crypt {
  // Berilgan matnni shifrlab qaytaradi
  static async hash(data: string) {
    return bcrypt.hash(data, 7);
  }

  // Oddiy matn shifrlangan matnga mos kelishini tekshiradi
  static async compare(data: string, hashedData: string) {
    return bcrypt.compare(data, hashedData);
  }
}
