// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

// Yangi imtihon qo'shish uchun yuboriladigan ma'lumot
export class CreateExamDto {
  // Imtihon o'tkaziladigan guruh raqami
  @IsInt()
  @IsNotEmpty()
  groupId!: number;

  // Imtihon nomi
  @IsString()
  @IsNotEmpty()
  title!: string;

  // Imtihon sanasi
  @IsDateString()
  @IsNotEmpty()
  examDate!: string;

  // Imtihondagi maksimal ball
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  maxScore!: number;
}
