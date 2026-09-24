import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateGroupStudentDto {
  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  @IsInt()
  @IsNotEmpty()
  studentId!: number;
}
