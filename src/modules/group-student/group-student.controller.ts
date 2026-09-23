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
// Guruh va o'quvchi bog'lanishi xizmati
import { GroupStudentService } from './group-student.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateGroupStudentDto } from './dto/create-group-student.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateGroupStudentDto } from './dto/update-group-student.dto';
// Tizimga kirganini tekshiruvchi guard
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
// Rolni tekshiruvchi guard
import { RolesGuard } from '../../common/guard/roles.guard';
// Ruxsat etilgan rollarni belgilovchi dekorator
import { AccessRoles } from '../../common/decorator/roles.decorator';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Guruhdagi o'quvchilar endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.SUPERADMIN)
@Controller('group-student')
export class GroupStudentController {
  constructor(private readonly groupStudentService: GroupStudentService) {}

  // O'quvchini guruhga qo'shish
  @Post()
  create(@Body() createGroupStudentDto: CreateGroupStudentDto) {
    return this.groupStudentService.create(createGroupStudentDto);
  }

  // Guruhdagi o'quvchilar ro'yxatini olish
  @AccessRoles(Roles.TEACHER)
  @Get(':groupId')
  findAll(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.groupStudentService.findAll(groupId);
  }

  // O'quvchining guruhdagi holatini o'zgartirish
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupStudentDto: UpdateGroupStudentDto,
  ) {
    return this.groupStudentService.update(id, updateGroupStudentDto);
  }

  // O'quvchini guruhdan chiqarish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupStudentService.remove(id);
  }
}
