import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @IsNotEmpty()
  courseId!: number;

  @IsInt()
  @IsNotEmpty()
  teacherId!: number;

  @IsInt()
  @IsNotEmpty()
  roomId!: number;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;
}
