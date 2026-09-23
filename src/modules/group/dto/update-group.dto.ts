// Barcha maydonlarni ixtiyoriy qiluvchi vosita
import { PartialType } from '@nestjs/swagger';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateGroupDto } from './create-group.dto';
// Kiruvchi ma'lumotni tekshiruvchi qoidalar
import { IsEnum, IsOptional } from 'class-validator';
// Guruh holatlari ro'yxati
import { GroupStatus } from '../../../common/enum';

// Guruhni tahrirlash uchun yuboriladigan ma'lumot
export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  // Guruhning yangi holati
  @IsEnum(GroupStatus)
  @IsOptional()
  status?: GroupStatus;
}
