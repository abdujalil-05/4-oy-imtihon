import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateExamDto {
  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsDateString()
  @IsNotEmpty()
  examDate!: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  maxScore!: number;
}
