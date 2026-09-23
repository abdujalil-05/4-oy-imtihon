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
// Davomat xizmati
import { AttendanceService } from './attendance.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateAttendanceDto } from './dto/create-attendance.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
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

// Davomat endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.TEACHER)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // O'quvchiga davomat belgilash
  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  // Darsdagi davomat ro'yxatini olish
  @Get('lesson/:lessonId')
  findAll(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.attendanceService.findAll(lessonId);
  }

  // O'quvchining o'z davomatini olish
  @AccessRoles(Roles.STUDENT)
  @Get('my')
  findMy(@UserId() userId: number) {
    return this.attendanceService.findByStudent(userId);
  }

  // Davomatni tahrirlash
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  // Davomat yozuvini o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}
