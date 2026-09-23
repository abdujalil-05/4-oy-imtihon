// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

// O'qituvchiga maosh yozish uchun yuboriladigan ma'lumot
export class CreateSalaryDto {
  // Maosh oluvchi o'qituvchi raqami
  @IsInt()
  @IsNotEmpty()
  teacherId!: number;

  // Maosh summasi so'mda
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  // Qaysi oy uchun ekanligi masalan 2026-09
  @Matches(/^\d{4}-\d{2}$/, { message: "Oy 2026-09 ko'rinishida bo'lsin" })
  @IsNotEmpty()
  month!: string;

  // Qo'shimcha izoh
  @IsString()
  @IsOptional()
  comment?: string;
}
