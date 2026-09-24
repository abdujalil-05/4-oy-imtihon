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
  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEnum(Roles)
  @IsNotEmpty()
  role!: Roles;

  @IsPhoneNumber('UZ')
  @IsOptional()
  phone?: string;
}
