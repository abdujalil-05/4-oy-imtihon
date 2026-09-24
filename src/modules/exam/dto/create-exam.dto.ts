import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateExamDto {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  @ApiProperty({
    type: String,
    example: '1-modul imtihoni',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    type: String,
    example: '2026-11-15T10:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  examDate!: string;

  @ApiProperty({
    type: Number,
    example: 100,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  maxScore!: number;
}
