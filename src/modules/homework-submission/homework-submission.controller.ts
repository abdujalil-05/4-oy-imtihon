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
import { HomeworkSubmissionService } from './homework-submission.service';
import { CreateHomeworkSubmissionDto } from './dto/create-homework-submission.dto';
import { UpdateHomeworkSubmissionDto } from './dto/update-homework-submission.dto';
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { AccessRoles } from '../../common/decorator/roles.decorator';
import { UserId } from '../../common/decorator/current-user.decorator';
import { Roles } from '../../common/enum';

@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.TEACHER)
@Controller('homework-submission')
export class HomeworkSubmissionController {
  constructor(
    private readonly homeworkSubmissionService: HomeworkSubmissionService,
  ) {}

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

  @Get('homework/:homeworkId')
  findAll(@Param('homeworkId', ParseIntPipe) homeworkId: number) {
    return this.homeworkSubmissionService.findAll(homeworkId);
  }

  @AccessRoles(Roles.STUDENT)
  @Get('my')
  findMy(@UserId() userId: number) {
    return this.homeworkSubmissionService.findByStudent(userId);
  }

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

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.homeworkSubmissionService.remove(id);
  }
}
