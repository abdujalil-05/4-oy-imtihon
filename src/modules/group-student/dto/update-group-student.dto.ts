// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsEnum, IsNotEmpty } from 'class-validator';
// Holatlar ro'yxati
import { Status } from '../../../common/enum';

// O'quvchining guruhdagi holatini o'zgartirish uchun ma'lumot
export class UpdateGroupStudentDto {
  // O'quvchining yangi holati
  @IsEnum(Status)
  @IsNotEmpty()
  status!: Status;
}
