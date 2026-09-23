// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsInt, IsNotEmpty, Min } from 'class-validator';

// Topshirilgan vazifaga baho qo'yish uchun yuboriladigan ma'lumot
export class UpdateHomeworkSubmissionDto {
  // O'qituvchi qo'ygan ball
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  score!: number;
}
