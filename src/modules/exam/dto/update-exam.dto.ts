// Barcha maydonlarni ixtiyoriy qiluvchi vosita
import { PartialType } from '@nestjs/swagger';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateExamDto } from './create-exam.dto';

// Imtihonni tahrirlash uchun yuboriladigan ma'lumot
export class UpdateExamDto extends PartialType(CreateExamDto) {}
