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
import { ExamResultService } from './exam-result.service';
import { CreateExamResultDto } from './dto/create-exam-result.dto';
import { UpdateExamResultDto } from './dto/update-exam-result.dto';
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { AccessRoles } from '../../common/decorator/roles.decorator';
import { UserId } from '../../common/decorator/current-user.decorator';
import { Roles } from '../../common/enum';

@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.TEACHER)
@Controller('exam-result')
export class ExamResultController {
  constructor(private readonly examResultService: ExamResultService) {}

  @Post()
  create(@Body() createExamResultDto: CreateExamResultDto) {
    return this.examResultService.create(createExamResultDto);
  }

  @Get('exam/:examId')
  findAll(@Param('examId', ParseIntPipe) examId: number) {
    return this.examResultService.findAll(examId);
  }

  @AccessRoles(Roles.STUDENT)
  @Get('my')
  findMy(@UserId() userId: number) {
    return this.examResultService.findByStudent(userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExamResultDto: UpdateExamResultDto,
  ) {
    return this.examResultService.update(id, updateExamResultDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.examResultService.remove(id);
  }
}
