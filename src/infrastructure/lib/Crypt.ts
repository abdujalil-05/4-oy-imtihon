import bcrypt from 'bcrypt'; // Parol xeshlash
import { env } from '../../config'; // Rounds .env dan

// Parol bilan ishlash — statik klass
export class Crypt {
  // Parolni xeshlash (bcrypt, rounds .env dan — TZ 11.1)
  static async hash(data: string) {
    return bcrypt.hash(data, env.AUTH.BCRYPT_ROUNDS);
  }

  // Parolni xesh bilan solishtirish
  static async compare(data: string, hashedData: string) {
    return bcrypt.compare(data, hashedData);
  }
}
