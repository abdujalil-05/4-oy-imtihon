import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateHomeworkSubmissionDto {
  @ApiProperty({
    type: Number,
    example: 95,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  score!: number;
}
