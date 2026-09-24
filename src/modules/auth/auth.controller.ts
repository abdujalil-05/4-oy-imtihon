import {
  Res,
  Body,
  Controller,
  Post,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import type { Response, Request } from 'express';
import { RefreshToken } from '../../common/decorator/get-cookie.decorator';
import { UserId } from '../../common/decorator/current-user.decorator';
import { AuthGuard } from '../../common/guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signIn(
    @Body() dto: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signIn(dto, req, res);
  }

  @Post('refresh')
  refreshToken(
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(refreshToken, res);
  }

  @Post('signout')
  signout(
    @RefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signOut(refreshToken, res);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  findMe(@UserId() userId: number) {
    return this.authService.findMe(userId);
  }
}
