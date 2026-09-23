// Token ichidagi ma'lumot ko'rinishi
import { IPayload } from '../../common/interface/IPayload.interface';
// Jwt bilan ishlovchi Nest xizmati
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
// Sozlamalar
import { env } from '../../config';
// Ruxsat yo'qligi haqidagi xato
import { UnauthorizedException } from '@nestjs/common';
// Express javob turi
import { Response } from 'express';
// Tokenlar juftligi ko'rinishi
import { IToken } from '../../common/interface/IToken.interface';

// Tokenlar bilan ishlovchi yordamchi klass
export class Token {
  // Jwt xizmatining yagona nusxasi
  private static readonly jwt = new JwtService();

  // Payload asosida access va refresh tokenlarni yasaydi
  static async getToken(payload: IPayload): Promise<IToken> {
    // Ikkala tokenni birga yasaymiz
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: env.TOKEN.ACCESS_KEY,
        expiresIn: env.TOKEN.ACCESS_TIME as JwtSignOptions['expiresIn'],
      }),
      this.jwt.signAsync(payload, {
        secret: env.TOKEN.REFRESH_KEY,
        expiresIn: env.TOKEN.REFRESH_TIME as JwtSignOptions['expiresIn'],
      }),
    ]);
    // Tayyor tokenlarni qaytaramiz
    return { accessToken, refreshToken };
  }

  // Tokenni tekshirib ichidagi ma'lumotni qaytaradi
  static async verifyToken(token: string, type: string): Promise<any> {
    try {
      // Token turiga qarab kerakli kalit bilan tekshiramiz
      const verifiedData = await this.jwt.verifyAsync(token, {
        secret:
          type === 'access' ? env.TOKEN.ACCESS_KEY : env.TOKEN.REFRESH_KEY,
      });
      // Ma'lumotni qaytaramiz
      return verifiedData;
    } catch (error) {
      // Token yaroqsiz bo'lsa xato qaytaramiz
      throw new UnauthorizedException('Tizimga kirishda nosozlik');
    }
  }

  // Tokenlarni cookie ichiga yozadi
  static setCookie(
    res: Response,
    accessToken: string,
    refreshToken?: string,
  ): void {
    // Access tokenni cookie ga yozamiz
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: parseInt(env.TOKEN.ACCESS_TIME) * 24 * 60 * 60 * 1000,
    });
    // Refresh token berilgan bo'lsa uni ham yozamiz
    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: parseInt(env.TOKEN.REFRESH_TIME) * 24 * 60 * 60 * 1000,
      });
    }
  }

  // Cookie dagi tokenlarni o'chiradi
  static clearCookie(res: Response): void {
    // Refresh tokenni o'chiramiz
    res.clearCookie('refreshToken');
    // Access tokenni o'chiramiz
    res.clearCookie('accessToken');
  }
}
