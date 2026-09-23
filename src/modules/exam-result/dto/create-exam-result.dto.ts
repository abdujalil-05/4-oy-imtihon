// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// Imtihon natijasini yozish uchun yuboriladigan ma'lumot
export class CreateExamResultDto {
  // Qaysi imtihon uchun ekanligi
  @IsInt()
  @IsNotEmpty()
  examId!: number;

  // O'quvchi raqami
  @IsInt()
  @IsNotEmpty()
  studentId!: number;

  // To'plangan ball
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  score!: number;

  // O'qituvchining izohi
  @IsString()
  @IsOptional()
  comment?: string;
}
