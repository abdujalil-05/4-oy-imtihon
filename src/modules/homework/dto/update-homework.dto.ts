// Barcha maydonlarni ixtiyoriy qiluvchi vosita
import { PartialType } from '@nestjs/swagger';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateHomeworkDto } from './create-homework.dto';

// Uy vazifasini tahrirlash uchun yuboriladigan ma'lumot
export class UpdateHomeworkDto extends PartialType(CreateHomeworkDto) {}
