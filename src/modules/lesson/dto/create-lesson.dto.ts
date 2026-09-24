import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  @ApiProperty({
    type: String,
    example: 'useState va useEffect hooklari',
  })
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @ApiProperty({
    type: String,
    example: '2026-10-05T14:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  lessonDate!: string;
}
