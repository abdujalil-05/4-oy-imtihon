// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// Imtihon natijasini tahrirlash uchun yuboriladigan ma'lumot
export class UpdateExamResultDto {
  // Yangi ball
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  score!: number;

  // O'qituvchining izohi
  @IsString()
  @IsOptional()
  comment?: string;
}
