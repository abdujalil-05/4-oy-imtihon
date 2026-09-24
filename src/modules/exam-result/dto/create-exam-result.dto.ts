import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateExamResultDto {
  @ApiProperty({
    type: Number,
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  examId!: number;

  @ApiProperty({
    type: Number,
    example: 7,
  })
  @IsInt()
  @IsNotEmpty()
  studentId!: number;

  @ApiProperty({
    type: Number,
    example: 87,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  score!: number;

  @ApiPropertyOptional({
    type: String,
    example: 'Nazariy qismi yaxshi, amaliyotda kamchiliklar bor',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
