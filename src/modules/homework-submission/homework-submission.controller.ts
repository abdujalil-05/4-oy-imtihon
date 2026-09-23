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
// Topshirilgan uy vazifalari xizmati
import { HomeworkSubmissionService } from './homework-submission.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateHomeworkSubmissionDto } from './dto/create-homework-submission.dto';
// Baho qo'yish uchun ishlatiladigan ma'lumot
import { UpdateHomeworkSubmissionDto } from './dto/update-homework-submission.dto';
// Tizimga kirganini tekshiruvchi guard
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
// Rolni tekshiruvchi guard
import { RolesGuard } from '../../common/guard/roles.guard';
// Ruxsat etilgan rollarni belgilovchi dekorator
import { AccessRoles } from '../../common/decorator/roles.decorator';
// Tokendan foydalanuvchi raqamini oluvchi dekorator
import { UserId } from '../../common/decorator/current-user.decorator';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Topshirilgan uy vazifalari endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.TEACHER)
@Controller('homework-submission')
export class HomeworkSubmissionController {
  constructor(
    private readonly homeworkSubmissionService: HomeworkSubmissionService,
  ) {}

  // O'quvchi uy vazifasini topshiradi
  @AccessRoles(Roles.STUDENT)
  @Post()
  create(
    @Body() createHomeworkSubmissionDto: CreateHomeworkSubmissionDto,
    @UserId() userId: number,
  ) {
    return this.homeworkSubmissionService.create(
      createHomeworkSubmissionDto,
      userId,
    );
  }

  // Uy vazifasiga topshirilgan javoblarni olish
  @Get('homework/:homeworkId')
  findAll(@Param('homeworkId', ParseIntPipe) homeworkId: number) {
    return this.homeworkSubmissionService.findAll(homeworkId);
  }

  // O'quvchining o'z javoblarini olish
  @AccessRoles(Roles.STUDENT)
  @Get('my')
  findMy(@UserId() userId: number) {
    return this.homeworkSubmissionService.findByStudent(userId);
  }

  // Topshirilgan vazifaga baho qo'yish
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomeworkSubmissionDto: UpdateHomeworkSubmissionDto,
  ) {
    return this.homeworkSubmissionService.update(
      id,
      updateHomeworkSubmissionDto,
    );
  }

  // Topshirilgan vazifani o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.homeworkSubmissionService.remove(id);
  }
}
