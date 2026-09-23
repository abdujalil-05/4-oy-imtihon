// Barcha maydonlarni ixtiyoriy qiluvchi vosita
import { PartialType } from '@nestjs/swagger';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateSalaryDto } from './create-salary.dto';

// Maoshni tahrirlash uchun yuboriladigan ma'lumot
export class UpdateSalaryDto extends PartialType(CreateSalaryDto) {}
