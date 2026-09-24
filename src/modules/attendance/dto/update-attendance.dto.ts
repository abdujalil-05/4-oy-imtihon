import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '../../../common/enum';

export class UpdateAttendanceDto {
  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
  })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status!: AttendanceStatus;

  @ApiPropertyOptional({
    type: String,
    example: 'Kechikkani sababli belgisi tuzatildi',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
