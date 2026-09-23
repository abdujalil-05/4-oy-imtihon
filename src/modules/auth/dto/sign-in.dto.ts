// Swagger uchun maydonni tavsiflovchi dekorator
import { ApiProperty } from '@nestjs/swagger';
// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsNotEmpty, IsString } from 'class-validator';

// Tizimga kirish uchun yuboriladigan ma'lumot
export class SignInDto {
  // Foydalanuvchining logini
  @ApiProperty({
    type: String,
    example: 'superadmin',
  })
  @IsString()
  @IsNotEmpty()
  login!: string;

  // Foydalanuvchining paroli
  @ApiProperty({
    type: String,
    example: 'Superadmin1!',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
