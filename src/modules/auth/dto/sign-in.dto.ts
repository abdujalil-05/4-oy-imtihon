import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Swagger
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'; // Validatsiya

// POST /auth/login tanasi
export class SignInDto {
  @ApiProperty({
    type: String,
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  login!: string; // Login

  @ApiProperty({
    type: String,
    example: 'admin12345',
  })
  @IsString()
  @IsNotEmpty()
  password!: string; // Parol

  @ApiPropertyOptional({
    type: String,
    example: 'Ish noutbuki',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  deviceName?: string; // Qurilma nomi (ixtiyoriy)
}
