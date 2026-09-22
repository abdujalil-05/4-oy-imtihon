import { ApiProperty } from '@nestjs/swagger'; // Swagger
import { IsNotEmpty, IsString } from 'class-validator'; // Validatsiya
import { IsPassword } from '../../../common/decorator/is-password.decorator'; // Parol qoidasi

// PATCH /auth/password tanasi
export class ChangePasswordDto {
  @ApiProperty({
    type: String,
    example: 'admin12345',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string; // Joriy parol

  @IsPassword('yangi1234')
  newPassword!: string; // Yangi parol (TZ 11.2 qoidalari)
}
