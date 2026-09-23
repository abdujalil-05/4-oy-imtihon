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
// Maoshlar xizmati
import { SalaryService } from './salary.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateSalaryDto } from './dto/create-salary.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateSalaryDto } from './dto/update-salary.dto';
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

// Maoshlar endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.SUPERADMIN)
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  // O'qituvchiga maosh yozish
  @Post()
  create(@Body() createSalaryDto: CreateSalaryDto) {
    return this.salaryService.create(createSalaryDto);
  }

  // Barcha maoshlar ro'yxatini olish
  @Get()
  findAll() {
    return this.salaryService.findAll();
  }

  // O'qituvchining o'z maoshlarini olish
  @AccessRoles(Roles.TEACHER)
  @Get('my')
  findMy(@UserId() userId: number) {
    return this.salaryService.findByTeacher(userId);
  }

  // Bitta o'qituvchining maoshlarini olish
  @Get('teacher/:teacherId')
  findByTeacher(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.salaryService.findByTeacher(teacherId);
  }

  // Maoshni tahrirlash
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalaryDto: UpdateSalaryDto,
  ) {
    return this.salaryService.update(id, updateSalaryDto);
  }

  // Maoshni o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salaryService.remove(id);
  }
}
