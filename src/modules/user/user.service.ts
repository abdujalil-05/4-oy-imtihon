import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { Crypt } from '../../infrastructure/lib/Crypt';
import { successRes } from '../../common/helper/success-response';
import { File } from '../../infrastructure/lib/File';

@Injectable()
export class UserService {
  constructor(private readonly db: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { login, password, fullName, role, phone } = createUserDto;
    const existsLogin = await this.db.user.findUnique({ where: { login } });
    if (existsLogin) {
      throw new ConflictException('Bunday login allaqachon mavjud');
    }
    const hashedPassword = await Crypt.hash(password);
    const user = await this.db.user.create({
      data: { login, hashedPassword, fullName, role, phone },
      select: {
        id: true,
        login: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
      },
    });
    return successRes(user, 201);
  }

  async findAll() {
    const users = await this.db.user.findMany({
      select: {
        id: true,
        login: true,
        fullName: true,
        phone: true,
        imageUrl: true,
        role: true,
        status: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return successRes(users);
  }

  async findOne(id: number) {
    const user = await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        fullName: true,
        phone: true,
        imageUrl: true,
        role: true,
        status: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    return successRes(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    image?: Express.Multer.File,
  ) {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    let hashedPassword = user.hashedPassword;
    if (updateUserDto.password) {
      hashedPassword = await Crypt.hash(updateUserDto.password);
    }
    let imageUrl = user.imageUrl;
    if (image) {
      if (imageUrl && (await File.exist(imageUrl))) {
        await File.delete(imageUrl);
      }
      imageUrl = await File.create(image);
    }
    delete updateUserDto.password;
    await this.db.user.update({
      where: { id },
      data: { imageUrl, hashedPassword, ...updateUserDto },
    });
    return successRes({});
  }

  async remove(id: number) {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    if (user.imageUrl && (await File.exist(user.imageUrl))) {
      await File.delete(user.imageUrl);
    }
    await this.db.devices.deleteMany({ where: { userId: id } });
    await this.db.user.delete({ where: { id } });
    return successRes({});
  }
}
