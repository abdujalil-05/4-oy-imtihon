import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateGroupStudentDto {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  @ApiProperty({
    type: Number,
    example: 7,
  })
  @IsInt()
  @IsNotEmpty()
  studentId!: number;
}
