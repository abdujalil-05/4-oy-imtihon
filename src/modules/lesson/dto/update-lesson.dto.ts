// Barcha maydonlarni ixtiyoriy qiluvchi vosita
import { PartialType } from '@nestjs/swagger';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateLessonDto } from './create-lesson.dto';

// Darsni tahrirlash uchun yuboriladigan ma'lumot
export class UpdateLessonDto extends PartialType(CreateLessonDto) {}
