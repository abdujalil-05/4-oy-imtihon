import { ApiPropertyOptional } from '@nestjs/swagger'; // Swagger
import { Transform } from 'class-transformer'; // Satr → boolean
import { IsBoolean, IsEnum, IsOptional } from 'class-validator'; // Validatsiya
import { Roles } from '../../../common/enum'; // Rollar

// GET /users query filtrlari
export class QueryUserDto {
  @ApiPropertyOptional({ enum: Roles })
  @IsEnum(Roles)
  @IsOptional()
  role?: Roles; // Rol bo'yicha

  @ApiPropertyOptional({ type: Boolean })
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  ) // "true" → true
  @IsBoolean()
  @IsOptional()
  isActive?: boolean; // Holat bo'yicha
}
