import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateExamResultDto {
  @IsInt()
  @IsNotEmpty()
  examId!: number;

  @IsInt()
  @IsNotEmpty()
  studentId!: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  score!: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
