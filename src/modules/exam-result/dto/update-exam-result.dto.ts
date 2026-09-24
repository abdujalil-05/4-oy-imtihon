import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateExamResultDto {
  @ApiProperty({
    type: Number,
    example: 92,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  score!: number;

  @ApiPropertyOptional({
    type: String,
    example: 'Imtihonni qayta topshirdi',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
