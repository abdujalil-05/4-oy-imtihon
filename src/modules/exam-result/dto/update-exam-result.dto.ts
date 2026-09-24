import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateExamResultDto {
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  score!: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
