// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Foydalanuvchilar xizmati
import { UserService } from './user.service';
// Foydalanuvchilar kontrolleri
import { UserController } from './user.controller';

// Foydalanuvchilar moduli
@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
