import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateHomeworkDto {
  @ApiProperty({
    type: Number,
    example: 4,
  })
  @IsInt()
  @IsNotEmpty()
  lessonId!: number;

  @ApiProperty({
    type: String,
    example: 'Todo ilovasini yozish',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    type: String,
    example: '2026-10-08T23:59:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  deadline!: string;

  @ApiPropertyOptional({
    type: String,
    example:
      'React hooklaridan foydalanib todo ilova tuzing va GitHub havolasini yuboring',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
