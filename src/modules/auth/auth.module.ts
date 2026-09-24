import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';

@Module({
  controllers: [AuthController, DeviceController],
  providers: [AuthService, DeviceService],
})
export class AuthModule {}
