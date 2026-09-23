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
// To'lovlar xizmati
import { PaymentService } from './payment.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreatePaymentDto } from './dto/create-payment.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdatePaymentDto } from './dto/update-payment.dto';
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

// To'lovlar endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.SUPERADMIN)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Yangi to'lov qo'shish
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  // Barcha to'lovlar ro'yxatini olish
  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  // O'quvchining o'z to'lovlarini olish
  @AccessRoles(Roles.STUDENT)
  @Get('my')
  findMy(@UserId() userId: number) {
    return this.paymentService.findByStudent(userId);
  }

  // Bitta o'quvchining to'lovlarini olish
  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.paymentService.findByStudent(studentId);
  }

  // To'lovni tahrirlash
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  // To'lovni o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.remove(id);
  }
}
