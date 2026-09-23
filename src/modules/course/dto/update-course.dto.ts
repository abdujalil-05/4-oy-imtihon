// Barcha maydonlarni ixtiyoriy qiluvchi vosita
import { PartialType } from '@nestjs/swagger';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateCourseDto } from './create-course.dto';
// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsEnum, IsOptional } from 'class-validator';
// Holatlar ro'yxati
import { Status } from '../../../common/enum';

// Kursni tahrirlash uchun yuboriladigan ma'lumot
export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  // Kursning yangi holati
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
