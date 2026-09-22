import { Module } from '@nestjs/common'; // Modul
import { UserService } from './user.service'; // Servis
import { UserController } from './user.controller'; // Controller
import { AuthModule } from '../auth/auth.module'; // DeviceService uchun

@Module({
  imports: [AuthModule], // DeviceService
  controllers: [UserController], // Endpointlar
  providers: [UserService], // Servis
})
export class UserModule {}
