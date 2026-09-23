// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// Yangi kurs yaratish uchun yuboriladigan ma'lumot
export class CreateCourseDto {
  // Kurs nomi
  @IsString()
  @IsNotEmpty()
  name!: string;

  // Kurs narxi so'mda
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  price!: number;

  // Kurs davomiyligi oyda
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  duration!: number;

  // Kurs haqida qisqacha ma'lumot
  @IsString()
  @IsOptional()
  description?: string;
}
