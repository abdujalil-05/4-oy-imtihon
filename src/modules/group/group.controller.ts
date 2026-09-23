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
// Guruhlar xizmati
import { GroupService } from './group.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateGroupDto } from './dto/create-group.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateGroupDto } from './dto/update-group.dto';
// Tizimga kirganini tekshiruvchi guard
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
// Rolni tekshiruvchi guard
import { RolesGuard } from '../../common/guard/roles.guard';
// Ruxsat etilgan rollarni belgilovchi dekorator
import { AccessRoles } from '../../common/decorator/roles.decorator';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Guruhlar endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.SUPERADMIN)
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // Yangi guruh ochish
  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }

  // Barcha guruhlar ro'yxatini olish
  @AccessRoles(Roles.TEACHER, Roles.STUDENT)
  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  // Bitta guruhni olish
  @AccessRoles(Roles.TEACHER, Roles.STUDENT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.findOne(id);
  }

  // Guruhni tahrirlash
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupService.update(id, updateGroupDto);
  }

  // Guruhni o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.remove(id);
  }
}
