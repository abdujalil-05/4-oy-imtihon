import { Module } from '@nestjs/common'; // Modul
import { AuthController } from './auth.controller'; // Auth endpointlari
import { AuthService } from './auth.service'; // Auth mantiqi
import { DeviceController } from './device.controller'; // Qurilma endpointlari
import { DeviceService } from './device.service'; // Qurilma mantiqi

@Module({
  controllers: [AuthController, DeviceController], // Controllerlar
  providers: [AuthService, DeviceService], // Servislar
  exports: [DeviceService], // UserModule (admin) ishlatadi
})
export class AuthModule {}
