// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

// Uy vazifasini topshirish uchun yuboriladigan ma'lumot
export class CreateHomeworkSubmissionDto {
  // Qaysi uy vazifasi uchun ekanligi
  @IsInt()
  @IsNotEmpty()
  homeworkId!: number;

  // O'quvchining javobi
  @IsString()
  @IsNotEmpty()
  answer!: string;
}
