import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateHomeworkSubmissionDto {
  @IsInt()
  @IsNotEmpty()
  homeworkId!: number;

  @IsString()
  @IsNotEmpty()
  answer!: string;
}
