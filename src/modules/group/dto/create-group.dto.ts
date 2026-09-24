import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    type: String,
    example: 'React N-12',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  courseId!: number;

  @ApiProperty({
    type: Number,
    example: 3,
  })
  @IsInt()
  @IsNotEmpty()
  teacherId!: number;

  @ApiProperty({
    type: Number,
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  roomId!: number;

  @ApiProperty({
    type: String,
    example: '2026-10-01T09:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;
}
