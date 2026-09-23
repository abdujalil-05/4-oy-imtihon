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
// Imtihon natijalari xizmati
import { ExamResultService } from './exam-result.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateExamResultDto } from './dto/create-exam-result.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateExamResultDto } from './dto/update-exam-result.dto';
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

// Imtihon natijalari endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.TEACHER)
@Controller('exam-result')
export class ExamResultController {
  constructor(private readonly examResultService: ExamResultService) {}

  // O'quvchiga imtihon bahosini qo'yish
  @Post()
  create(@Body() createExamResultDto: CreateExamResultDto) {
    return this.examResultService.create(createExamResultDto);
  }

  // Imtihondagi natijalar ro'yxatini olish
  @Get('exam/:examId')
  findAll(@Param('examId', ParseIntPipe) examId: number) {
    return this.examResultService.findAll(examId);
  }

  // O'quvchining o'z natijalarini olish
  @AccessRoles(Roles.STUDENT)
  @Get('my')
  findMy(@UserId() userId: number) {
    return this.examResultService.findByStudent(userId);
  }

  // Natijani tahrirlash
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExamResultDto: UpdateExamResultDto,
  ) {
    return this.examResultService.update(id, updateExamResultDto);
  }

  // Natijani o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.examResultService.remove(id);
  }
}
