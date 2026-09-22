import { ApiProperty } from '@nestjs/swagger'; // Swagger
import { IsBoolean, IsNotEmpty } from 'class-validator'; // Validatsiya

// PATCH /users/:id/status tanasi
export class UpdateStatusDto {
  @ApiProperty({
    type: Boolean,
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean; // true — ochish, false — bloklash
}
