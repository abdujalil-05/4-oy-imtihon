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
// Kurslar xizmati
import { CourseService } from './course.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateCourseDto } from './dto/create-course.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateCourseDto } from './dto/update-course.dto';
// Tizimga kirganini tekshiruvchi guard
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
// Rolni tekshiruvchi guard
import { RolesGuard } from '../../common/guard/roles.guard';
// Ruxsat etilgan rollarni belgilovchi dekorator
import { AccessRoles } from '../../common/decorator/roles.decorator';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Kurslar endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.SUPERADMIN)
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // Yangi kurs qo'shish
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  // Barcha kurslar ro'yxatini olish
  @AccessRoles(Roles.TEACHER, Roles.STUDENT)
  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  // Bitta kursni olish
  @AccessRoles(Roles.TEACHER, Roles.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOne(id);
  }

  // Kursni tahrirlash
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, updateCourseDto);
  }

  // Kursni o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.remove(id);
  }
}
