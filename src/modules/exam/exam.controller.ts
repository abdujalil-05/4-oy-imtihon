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
// Imtihonlar xizmati
import { ExamService } from './exam.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateExamDto } from './dto/create-exam.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateExamDto } from './dto/update-exam.dto';
// Tizimga kirganini tekshiruvchi guard
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
// Rolni tekshiruvchi guard
import { RolesGuard } from '../../common/guard/roles.guard';
// Ruxsat etilgan rollarni belgilovchi dekorator
import { AccessRoles } from '../../common/decorator/roles.decorator';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Imtihonlar endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.TEACHER)
@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  // Yangi imtihon qo'shish
  @Post()
  create(@Body() createExamDto: CreateExamDto) {
    return this.examService.create(createExamDto);
  }

  // Guruhdagi imtihonlar ro'yxatini olish
  @AccessRoles(Roles.TEACHER, Roles.STUDENT)
  @Get('group/:groupId')
  findAll(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.examService.findAll(groupId);
  }

  // Bitta imtihonni olish
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.examService.findOne(id);
  }

  // Imtihonni tahrirlash
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExamDto: UpdateExamDto,
  ) {
    return this.examService.update(id, updateExamDto);
  }

  // Imtihonni o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.examService.remove(id);
  }
}
