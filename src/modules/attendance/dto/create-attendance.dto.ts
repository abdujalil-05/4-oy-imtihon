import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatus } from '../../../common/enum';

export class CreateAttendanceDto {
  @ApiProperty({
    type: Number,
    example: 4,
  })
  @IsInt()
  @IsNotEmpty()
  lessonId!: number;

  @ApiProperty({
    type: Number,
    example: 7,
  })
  @IsInt()
  @IsNotEmpty()
  studentId!: number;

  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.LATE,
  })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status!: AttendanceStatus;

  @ApiPropertyOptional({
    type: String,
    example: 'Darsga 15 daqiqa kechikib keldi',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
