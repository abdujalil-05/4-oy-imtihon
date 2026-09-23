// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Tizimga kirish kontrolleri
import { AuthController } from './auth.controller';
// Tizimga kirish xizmati
import { AuthService } from './auth.service';
// Qurilmalar kontrolleri
import { DeviceController } from './device.controller';
// Qurilmalar xizmati
import { DeviceService } from './device.service';

// Tizimga kirish va qurilmalar moduli
@Module({
  controllers: [AuthController, DeviceController],
  providers: [AuthService, DeviceService],
})
export class AuthModule {}
