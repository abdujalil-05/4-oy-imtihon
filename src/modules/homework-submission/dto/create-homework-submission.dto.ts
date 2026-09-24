import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateHomeworkSubmissionDto {
  @ApiProperty({
    type: Number,
    example: 3,
  })
  @IsInt()
  @IsNotEmpty()
  homeworkId!: number;

  @ApiProperty({
    type: String,
    example: 'https://github.com/ulugbek-karimov/todo-app',
  })
  @IsString()
  @IsNotEmpty()
  answer!: string;
}
