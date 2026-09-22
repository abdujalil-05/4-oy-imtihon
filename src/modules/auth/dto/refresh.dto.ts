import { ApiProperty } from '@nestjs/swagger'; // Swagger
import { IsNotEmpty, IsString, Length } from 'class-validator'; // Validatsiya

// POST /auth/refresh tanasi
export class RefreshDto {
  @ApiProperty({
    type: String,
    example: 'a1b2c3...(128 belgi)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(128, 128, { message: "Refresh token formati noto'g'ri" }) // 64 bayt hex = 128 belgi
  refreshToken!: string; // Refresh token
}
