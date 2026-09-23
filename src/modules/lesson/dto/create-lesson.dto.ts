// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

// Yangi dars qo'shish uchun yuboriladigan ma'lumot
export class CreateLessonDto {
  // Dars o'tiladigan guruh raqami
  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  // Dars mavzusi
  @IsString()
  @IsNotEmpty()
  topic!: string;

  // Dars o'tiladigan sana
  @IsDateString()
  @IsNotEmpty()
  lessonDate!: string;
}
