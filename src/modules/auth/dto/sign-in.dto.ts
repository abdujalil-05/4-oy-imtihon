import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    type: String,
    example: 'superadmin',
  })
  @IsString()
  @IsNotEmpty()
  login!: string;

  @ApiProperty({
    type: String,
    example: 'Superadmin1!',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
