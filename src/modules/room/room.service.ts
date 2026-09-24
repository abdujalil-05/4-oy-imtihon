import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../../config/database/prisma.service';
import { successRes } from '../../common/helper/success-response';

@Injectable()
export class RoomService {
  constructor(private readonly db: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    const existsName = await this.db.room.findUnique({
      where: { name: createRoomDto.name },
    });
    if (existsName) {
      throw new ConflictException('Bunday nomli xona allaqachon mavjud');
    }
    const room = await this.db.room.create({ data: createRoomDto });
    return successRes(room, 201);
  }

  async findAll() {
    const rooms = await this.db.room.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return successRes(rooms);
  }

  async findOne(id: number) {
    const room = await this.db.room.findUnique({
      where: { id },
      include: { groups: true },
    });
    if (!room) {
      throw new NotFoundException('Xona topilmadi');
    }
    return successRes(room);
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    const room = await this.db.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException('Xona topilmadi');
    }
    await this.db.room.update({ where: { id }, data: updateRoomDto });
    return successRes({});
  }

  async remove(id: number) {
    const room = await this.db.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException('Xona topilmadi');
    }
    const group = await this.db.group.findFirst({ where: { roomId: id } });
    if (group) {
      throw new ConflictException("Xonada guruhlar bor, o'chirib bo'lmaydi");
    }
    await this.db.room.delete({ where: { id } });
    return successRes({});
  }
}
