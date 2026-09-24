import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateSalaryDto {
  @ApiProperty({
    type: Number,
    example: 3,
  })
  @IsInt()
  @IsNotEmpty()
  teacherId!: number;

  @ApiProperty({
    type: Number,
    example: 7500000,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({
    type: String,
    example: '2026-09',
  })
  @Matches(/^\d{4}-\d{2}$/, { message: "Oy 2026-09 ko'rinishida bo'lsin" })
  @IsNotEmpty()
  month!: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Sentyabr oyi uchun maosh, 2 ta guruh',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
