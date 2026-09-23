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
// Darslar xizmati
import { LessonService } from './lesson.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateLessonDto } from './dto/create-lesson.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateLessonDto } from './dto/update-lesson.dto';
// Tizimga kirganini tekshiruvchi guard
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
// Rolni tekshiruvchi guard
import { RolesGuard } from '../../common/guard/roles.guard';
// Ruxsat etilgan rollarni belgilovchi dekorator
import { AccessRoles } from '../../common/decorator/roles.decorator';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Darslar endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.TEACHER)
@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  // Yangi dars qo'shish
  @Post()
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.create(createLessonDto);
  }

  // Guruhdagi darslar ro'yxatini olish
  @AccessRoles(Roles.TEACHER, Roles.STUDENT)
  @Get('group/:groupId')
  findAll(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.lessonService.findAll(groupId);
  }

  // Bitta darsni olish
  @AccessRoles(Roles.TEACHER, Roles.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.findOne(id);
  }

  // Darsni tahrirlash
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonService.update(id, updateLessonDto);
  }

  // Darsni o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.remove(id);
  }
}
