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
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { AccessRoles } from '../../common/decorator/roles.decorator';
import { UserId } from '../../common/decorator/current-user.decorator';
import { Roles } from '../../common/enum';

@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.SUPERADMIN)
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post()
  create(@Body() createSalaryDto: CreateSalaryDto) {
    return this.salaryService.create(createSalaryDto);
  }

  @Get()
  findAll() {
    return this.salaryService.findAll();
  }

  @AccessRoles(Roles.TEACHER)
  @Get('my')
  findMy(@UserId() userId: number) {
    return this.salaryService.findByTeacher(userId);
  }

  @Get('teacher/:teacherId')
  findByTeacher(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.salaryService.findByTeacher(teacherId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalaryDto: UpdateSalaryDto,
  ) {
    return this.salaryService.update(id, updateSalaryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salaryService.remove(id);
  }
}
