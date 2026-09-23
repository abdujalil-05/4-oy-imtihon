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
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
// Foydalanuvchilar xizmati
import { UserService } from './user.service';
// Yaratish uchun ishlatiladigan ma'lumot
import { CreateUserDto } from './dto/create-user.dto';
// Tahrirlash uchun ishlatiladigan ma'lumot
import { UpdateUserDto } from './dto/update-user.dto';
// Tizimga kirganini tekshiruvchi guard
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
// Rolni tekshiruvchi guard
import { RolesGuard } from '../../common/guard/roles.guard';
// Ruxsat etilgan rollarni belgilovchi dekorator
import { AccessRoles } from '../../common/decorator/roles.decorator';
// Faylni qabul qiluvchi interceptor
import { FileInterceptor } from '@nestjs/platform-express';
// Rasmni tekshiruvchi pipe
import { ImageValidationPipe } from '../../common/pipe/image-validation.pipe';
// Rollar ro'yxati
import { Roles } from '../../common/enum';

// Foydalanuvchilar endpointlari
@UseGuards(AuthGuard, RolesGuard)
@AccessRoles(Roles.SUPERADMIN)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Yangi o'qituvchi yoki o'quvchi yaratish
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Barcha foydalanuvchilar ro'yxatini olish
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Bitta foydalanuvchini olish
  @AccessRoles('ID')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // Foydalanuvchini tahrirlash
  @AccessRoles('ID')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(new ImageValidationPipe()) image?: Express.Multer.File,
  ) {
    return this.userService.update(id, updateUserDto, image);
  }

  // Foydalanuvchini o'chirish
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
