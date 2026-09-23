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
// Uy vazifalari xizmati
import { HomeworkService } from './homework.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateHomeworkDto } from './dto/create-homework.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateHomeworkDto } from './dto/update-homework.dto';
// Tizimga kirganini tekshiruvchi guard
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
// Rolni tekshiruvchi guard
import { RolesGuard } from '../../common/guard/roles.guard';
// Ruxsat etilgan rollarni belgilovchi dekorator
import { AccessRoles } from '../../common/decorator/roles.decorator';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Uy vazifalari endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.TEACHER)
@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  // Yangi uy vazifasi berish
  @Post()
  create(@Body() createHomeworkDto: CreateHomeworkDto) {
    return this.homeworkService.create(createHomeworkDto);
  }

  // Darsga berilgan uy vazifalarini olish
  @AccessRoles(Roles.TEACHER, Roles.STUDENT)
  @Get('lesson/:lessonId')
  findAll(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.homeworkService.findAll(lessonId);
  }

  // Bitta uy vazifasini olish
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.homeworkService.findOne(id);
  }

  // Uy vazifasini tahrirlash
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomeworkDto: UpdateHomeworkDto,
  ) {
    return this.homeworkService.update(id, updateHomeworkDto);
  }

  // Uy vazifasini o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.homeworkService.remove(id);
  }
}
