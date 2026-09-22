import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common'; // HTTP
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; // Swagger
import { Throttle } from '@nestjs/throttler'; // Chastota cheklovi
import type { Request } from 'express'; // So'rov tipi
import { AuthService } from './auth.service'; // Servis
import { SignInDto } from './dto/sign-in.dto'; // DTO
import { RefreshDto } from './dto/refresh.dto'; // DTO
import { ChangePasswordDto } from './dto/change-password.dto'; // DTO
import { Public } from '../../common/decorator/public.decorator'; // @Public
import { CurrentUser } from '../../common/decorator/current-user.decorator'; // req.user
import type { IUser } from '../../common/interface/IUser.interface'; // Tip

// Auth endpointlari (TZ 10.1)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login — ochiq, IP boshiga 10 ta/daqiqa
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  signIn(@Body() dto: SignInDto, @Req() req: Request) {
    return this.authService.signIn(dto, req);
  }

  // POST /auth/refresh — ochiq, IP boshiga 20 ta/daqiqa
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  refreshToken(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.authService.refreshToken(dto.refreshToken, req);
  }

  // POST /auth/logout — joriy qurilmadan chiqish
  @ApiBearerAuth()
  @Post('logout')
  signOut(@CurrentUser() user: IUser) {
    return this.authService.signOut(user);
  }

  // POST /auth/logout-all — hammasidan chiqish
  @ApiBearerAuth()
  @Post('logout-all')
  signOutAll(@CurrentUser() user: IUser) {
    return this.authService.signOutAll(user);
  }

  // GET /auth/me — joriy foydalanuvchi
  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: IUser) {
    return this.authService.me(user);
  }

  // PATCH /auth/password — parolni o'zgartirish
  @ApiBearerAuth()
  @Patch('password')
  changePassword(@CurrentUser() user: IUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      user,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
