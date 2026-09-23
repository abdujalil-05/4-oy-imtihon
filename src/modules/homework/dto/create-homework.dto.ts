// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

// Yangi uy vazifasi berish uchun yuboriladigan ma'lumot
export class CreateHomeworkDto {
  // Qaysi darsga berilayotgani
  @IsInt()
  @IsNotEmpty()
  lessonId!: number;

  // Uy vazifasi sarlavhasi
  @IsString()
  @IsNotEmpty()
  title!: string;

  // Topshirish muddati
  @IsDateString()
  @IsNotEmpty()
  deadline!: string;

  // Uy vazifasi sharti
  @IsString()
  @IsOptional()
  description?: string;
}
