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
import { GroupStudentService } from './group-student.service';
import { CreateGroupStudentDto } from './dto/create-group-student.dto';
import { UpdateGroupStudentDto } from './dto/update-group-student.dto';
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { AccessRoles } from '../../common/decorator/roles.decorator';
import { Roles } from '../../common/enum';

@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.SUPERADMIN)
@Controller('group-student')
export class GroupStudentController {
  constructor(private readonly groupStudentService: GroupStudentService) {}

  @Post()
  create(@Body() createGroupStudentDto: CreateGroupStudentDto) {
    return this.groupStudentService.create(createGroupStudentDto);
  }

  @AccessRoles(Roles.TEACHER)
  @Get(':groupId')
  findAll(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.groupStudentService.findAll(groupId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupStudentDto: UpdateGroupStudentDto,
  ) {
    return this.groupStudentService.update(id, updateGroupStudentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupStudentService.remove(id);
  }
}
