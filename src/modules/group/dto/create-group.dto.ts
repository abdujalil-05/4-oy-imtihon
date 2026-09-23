// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

// Yangi guruh ochish uchun yuboriladigan ma'lumot
export class CreateGroupDto {
  // Guruh nomi
  @IsString()
  @IsNotEmpty()
  name!: string;

  // Guruh tegishli bo'lgan kurs raqami
  @IsInt()
  @IsNotEmpty()
  courseId!: number;

  // Guruhga biriktirilgan o'qituvchi raqami
  @IsInt()
  @IsNotEmpty()
  teacherId!: number;

  // Guruh o'qiydigan xona raqami
  @IsInt()
  @IsNotEmpty()
  roomId!: number;

  // Dars boshlanish sanasi
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;
}
