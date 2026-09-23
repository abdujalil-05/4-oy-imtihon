// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
// Rollar ro'yxati
import { Roles } from '../../../common/enum';

// Yangi foydalanuvchi yaratish uchun yuboriladigan ma'lumot
export class CreateUserDto {
  // Tizimga kirish uchun login
  @IsString()
  @IsNotEmpty()
  login!: string;

  // Tizimga kirish uchun parol
  @IsStrongPassword()
  @IsNotEmpty()
  password!: string;

  // Foydalanuvchining to'liq ismi
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  // Foydalanuvchining roli
  @IsEnum(Roles)
  @IsNotEmpty()
  role!: Roles;

  // Foydalanuvchining telefon raqami
  @IsPhoneNumber('UZ')
  @IsOptional()
  phone?: string;
}
