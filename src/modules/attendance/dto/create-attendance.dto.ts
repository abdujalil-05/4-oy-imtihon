// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
// Davomat belgilari ro'yxati
import { AttendanceStatus } from '../../../common/enum';

// Davomat belgilash uchun yuboriladigan ma'lumot
export class CreateAttendanceDto {
  // Qaysi dars uchun ekanligi
  @IsInt()
  @IsNotEmpty()
  lessonId!: number;

  // O'quvchi raqami
  @IsInt()
  @IsNotEmpty()
  studentId!: number;

  // Davomat belgisi
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status!: AttendanceStatus;

  // Qo'shimcha izoh
  @IsString()
  @IsOptional()
  comment?: string;
}
