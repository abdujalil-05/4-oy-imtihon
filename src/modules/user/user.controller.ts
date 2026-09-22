import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'; // HTTP
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; // Swagger
import { UserService } from './user.service'; // Servis
import { CreateUserDto } from './dto/create-user.dto'; // DTO
import { UpdateStatusDto } from './dto/update-status.dto'; // DTO
import { ResetPasswordDto } from './dto/reset-password.dto'; // DTO
import { QueryUserDto } from './dto/query-user.dto'; // DTO
import { AccessRoles } from '../../common/decorator/roles.decorator'; // @AccessRoles
import { UserId } from '../../common/decorator/current-user.decorator'; // @UserId
import { Roles } from '../../common/enum'; // Rollar

// Admin endpointlari — hammasi faqat ADMIN (TZ 10.2)
@ApiTags('users')
@ApiBearerAuth()
@AccessRoles(Roles.ADMIN)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST /users — yaratish
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  // GET /users — ro'yxat
  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  // PATCH /users/:id/status — bloklash / ochish
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
    @UserId() adminId: number, // O'zini bloklamasligi uchun
  ) {
    return this.userService.updateStatus(id, dto.isActive, adminId);
  }

  // PATCH /users/:id/password — parolni tiklash
  @Patch(':id/password')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.userService.resetPassword(id, dto.newPassword);
  }

  // GET /users/:id/sessions — qurilmalari
  @Get(':id/sessions')
  findDevices(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findDevices(id);
  }

  // DELETE /users/:id/sessions — hammasidan chiqarish
  @Delete(':id/sessions')
  removeDevices(@Param('id', ParseIntPipe) id: number) {
    return this.userService.removeDevices(id);
  }
}
