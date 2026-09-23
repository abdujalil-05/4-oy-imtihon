// Kerakli Nest dekoratorlari
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
// Xonalar xizmati
import { RoomService } from './room.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateRoomDto } from './dto/create-room.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateRoomDto } from './dto/update-room.dto';
// Tizimga kirganini tekshiruvchi guard
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
// Rolni tekshiruvchi guard
import { RolesGuard } from '../../common/guard/roles.guard';
// Ruxsat etilgan rollarni belgilovchi dekorator
import { AccessRoles } from '../../common/decorator/roles.decorator';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Xonalar endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.SUPERADMIN)
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // Yangi xona qo'shish
  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  // Barcha xonalar ro'yxatini olish
  @AccessRoles(Roles.TEACHER)
  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  // Bitta xonani olish
  @AccessRoles(Roles.TEACHER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findOne(id);
  }

  // Xonani tahrirlash
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.update(id, updateRoomDto);
  }

  // Xonani o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }
}
