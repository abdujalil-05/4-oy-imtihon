import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '../../../common/enum';

export class UpdateAttendanceDto {
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status!: AttendanceStatus;

  @IsString()
  @IsOptional()
  comment?: string;
}
