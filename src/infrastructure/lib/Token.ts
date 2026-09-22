import { JwtService, JwtSignOptions } from '@nestjs/jwt'; // JWT
import { UnauthorizedException } from '@nestjs/common'; // 401
import { createHash, randomBytes } from 'crypto'; // Node crypto
import { env } from '../../config'; // Sozlamalar
import { IPayload } from '../../common/interface/IPayload.interface'; // Token ichidagi ma'lumot

// Tokenlar bilan ishlash — statik klass
export class Token {
  private static readonly jwt = new JwtService(); // JWT servisi

  // Access token (JWT, HS256, 15 daqiqa) — TZ 5.1
  static async getAccessToken(payload: IPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: env.TOKEN.ACCESS_KEY, // Imzo kaliti
      expiresIn: env.TOKEN.ACCESS_TIME as JwtSignOptions['expiresIn'], // Muddat
      algorithm: 'HS256', // Algoritm
    });
  }

  // Access tokenni tekshirish — imzo, muddat, faqat HS256 (TZ 11.3)
  static async verifyAccessToken(token: string): Promise<IPayload> {
    try {
      return await this.jwt.verifyAsync<IPayload>(token, {
        secret: env.TOKEN.ACCESS_KEY, // Kalit
        algorithms: ['HS256'], // "none" rad etiladi
      });
    } catch {
      throw new UnauthorizedException("Token yaroqsiz yoki muddati o'tgan");
    }
  }

  // Refresh token — JWT emas, 64 bayt kriptografik tasodif (TZ 5.2)
  static getRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  // Refresh tokenning SHA-256 xeshi — bazada faqat shu saqlanadi
  static hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // Refresh token tugash vaqti = hozir + N kun
  static refreshExpiresAt(): Date {
    return new Date(Date.now() + env.TOKEN.REFRESH_DAYS * 24 * 60 * 60 * 1000);
  }

  // Access token muddati sekundlarda ("15m" → 900) — javobda qaytarish uchun
  static accessTtlSeconds(): number {
    const time = env.TOKEN.ACCESS_TIME; // "15m"
    const value = parseInt(time, 10); // 15
    const unit = time.slice(-1); // "m"
    if (unit === 'h') return value * 3600;
    if (unit === 'm') return value * 60;
    return value;
  }
}
