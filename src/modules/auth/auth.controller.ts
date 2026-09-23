// Kerakli Nest dekoratorlari
import {
  Res,
  Body,
  Controller,
  Post,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
// Tizimga kirish xizmati
import { AuthService } from './auth.service';
// Tizimga kirish ma'lumoti
import { SignInDto } from './dto/sign-in.dto';
// Express so'rov va javob turlari
import type { Response, Request } from 'express';
// Cookie dan refresh tokenni oluvchi dekorator
import { RefreshToken } from '../../common/decorator/get-cookie.decorator';
// Tokendan foydalanuvchi raqamini oluvchi dekorator
import { UserId } from '../../common/decorator/current-user.decorator';
// Tizimga kirganini tekshiruvchi guard
import { AuthGuard } from '../../common/guard/jwt-auth.guard';

// Tizimga kirish endpointlari
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Login va parol bilan tizimga kirish
  @Post('signin')
  signIn(
    @Body() dto: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signIn(dto, req, res);
  }

  // Access tokenni yangilash
  @Post('refresh')
  refreshToken(
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(refreshToken, res);
  }

  // Tizimdan chiqish
  @Post('signout')
  signout(
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signOut(refreshToken, res);
  }

  // O'zi haqidagi ma'lumotni olish
  @UseGuards(AuthGuard)
  @Get('me')
  findMe(@UserId() userId: number) {
    return this.authService.findMe(userId);
  }
}
