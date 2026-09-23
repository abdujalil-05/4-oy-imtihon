// Barcha maydonlarni ixtiyoriy qiluvchi vosita
import { PartialType } from '@nestjs/swagger';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateUserDto } from './create-user.dto';
// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsEnum, IsOptional } from 'class-validator';
// Holatlar ro'yxati
import { Status } from '../../../common/enum';

// Foydalanuvchini tahrirlash uchun yuboriladigan ma'lumot
export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Foydalanuvchining yangi holati
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
