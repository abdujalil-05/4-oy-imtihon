// Barcha maydonlarni ixtiyoriy qiluvchi vosita
import { PartialType } from '@nestjs/swagger';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateRoomDto } from './create-room.dto';

// Xonani tahrirlash uchun yuboriladigan ma'lumot
export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
