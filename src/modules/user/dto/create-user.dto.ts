import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Roles } from '../../../common/enum';

export class CreateUserDto {
  @ApiProperty({
    type: String,
    example: 'ulugbek_karimov',
  })
  @IsString()
  @IsNotEmpty()
  login!: string;

  @ApiProperty({
    type: String,
    example: 'Ulugbek2026!',
  })
  @IsStrongPassword()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    type: String,
    example: "Ulug'bek Karimov",
  })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    enum: Roles,
    example: Roles.TEACHER,
  })
  @IsEnum(Roles)
  @IsNotEmpty()
  role!: Roles;

  @ApiPropertyOptional({
    type: String,
    example: '+998901234567',
  })
  @IsPhoneNumber('UZ')
  @IsOptional()
  phone?: string;
}
