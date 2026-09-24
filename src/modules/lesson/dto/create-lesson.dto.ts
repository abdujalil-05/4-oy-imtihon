import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateLessonDto {
  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  @IsString()
  @IsNotEmpty()
  topic!: string;

  @IsDateString()
  @IsNotEmpty()
  lessonDate!: string;
}
