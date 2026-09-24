import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateHomeworkSubmissionDto {
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  score!: number;
}
