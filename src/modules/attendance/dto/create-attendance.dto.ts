import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AttendanceStatus } from '../../../common/enum';

export class CreateAttendanceDto {
  @IsInt()
  @IsNotEmpty()
  lessonId!: number;

  @IsInt()
  @IsNotEmpty()
  studentId!: number;

  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status!: AttendanceStatus;

  @IsString()
  @IsOptional()
  comment?: string;
}
