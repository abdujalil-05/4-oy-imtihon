// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
// Davomat belgilari ro'yxati
import { AttendanceStatus } from '../../../common/enum';

// Davomatni tahrirlash uchun yuboriladigan ma'lumot
export class UpdateAttendanceDto {
  // Yangi davomat belgisi
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status!: AttendanceStatus;

  // Qo'shimcha izoh
  @IsString()
  @IsOptional()
  comment?: string;
}
