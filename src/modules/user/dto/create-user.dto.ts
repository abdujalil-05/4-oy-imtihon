import { ApiProperty } from '@nestjs/swagger'; // Swagger
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator'; // Validatsiya
import { Roles } from '../../../common/enum'; // Rollar
import { IsPassword } from '../../../common/decorator/is-password.decorator'; // Parol qoidasi

// POST /users tanasi
export class CreateUserDto {
  @ApiProperty({
    type: String,
    example: 'ali',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  login!: string; // Login (kichik harfga o'tkaziladi)

  @IsPassword('ali12345')
  password!: string; // Vaqtinchalik parol

  @ApiProperty({
    type: String,
    example: 'Ali Valiyev',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  fullName!: string; // Ism

  @ApiProperty({
    enum: Roles,
    example: Roles.TEACHER,
  })
  @IsEnum(Roles)
  @IsNotEmpty()
  role!: Roles; // Rol
}
