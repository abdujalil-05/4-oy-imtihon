import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateHomeworkDto {
  @IsInt()
  @IsNotEmpty()
  lessonId!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsDateString()
  @IsNotEmpty()
  deadline!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
