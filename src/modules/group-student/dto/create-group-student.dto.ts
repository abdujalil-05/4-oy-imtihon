// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsInt, IsNotEmpty } from 'class-validator';

// O'quvchini guruhga qo'shish uchun yuboriladigan ma'lumot
export class CreateGroupStudentDto {
  // Guruh raqami
  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  // O'quvchi raqami
  @IsInt()
  @IsNotEmpty()
  studentId!: number;
}
