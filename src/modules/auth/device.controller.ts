// Kerakli Nest dekoratorlari
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
// Qurilmalar xizmati
import { DeviceService } from './device.service';
// Tokendan foydalanuvchi raqamini oluvchi dekorator
import { UserId } from '../../common/decorator/current-user.decorator';
// Tizimga kirganini tekshiruvchi guard
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
// Cookie dan refresh tokenni oluvchi dekorator
import { RefreshToken } from '../../common/decorator/get-cookie.decorator';

// Qurilmalar endpointlari
@UseGuards(AuthGuard)
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  // O'zining qurilmalari ro'yxatini olish
  @Get()
  findAll(@UserId() userId: number) {
    return this.deviceService.findAll(userId);
  }

  // Eski qurilmani o'chirish
  @Delete(':id')
  remove(
    @RefreshToken() refreshToken: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.deviceService.remove(refreshToken, id);
  }
}
