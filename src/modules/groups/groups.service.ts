import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../config/database/prisma.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { successRes } from "../../common/helper/success-response";
import { Roles } from "../../common/enum";

@Injectable()
export class GroupsService {
    constructor(private readonly db: PrismaService) { }

    async findAll() {
        return successRes(await this.db.groups.findMany({
            include: {
                students:
                {
                    include:
                    {
                        user: {
                            select: {
                                fullName: true,
                            }
                        }
                    },
                    select: {
                        groups: true
                    }
                }
            }
        }
        ))
    }

    async findById(id: number) {
        const group = await this.db.groups.findUnique({
            where: { id }, include: {
                students:
                {
                    include:
                    {
                        user: {
                            select: {
                                fullName: true,
                            }
                        }
                    },
                    select: {
                        groups: true
                    }
                }
            }
        })
        

    if(!group) {
        throw new NotFoundException('Guruh Topilmadi')
    }
        return successRes(group)
    }

    async create(dto: CreateGroupDto) {
    const teacher = await this.db.user.findUnique({ where: { id: dto.teacherId } })
    if (!teacher) {
        throw new NotFoundException('Bunday idli Foydalanuvchi topilmadi')
    }
    if (teacher?.role !== Roles.TEACHER) {
        throw new BadRequestException('Tanlangan inson Oqituvchi emas')
    }
    const group = await this.db.groups.create({
        data: {
            name: dto.name,
            teacherId: dto.teacherId
        }
    })

    return successRes(group, 201)

}

    async update(id: number, dto: UpdateGroupDto) {
    const existsGroup = await this.db.groups.findUnique({ where: { id } })
    if (!existsGroup) {
        throw new NotFoundException('Guruh topilmadi')
    }

    if (dto.name && dto.name !== existsGroup.name) {
        const isNameTaken = await this.db.groups.findUnique({ where: { name: dto.name } })
        if (isNameTaken) {
            throw new BadRequestException('Bunday guruh nomi band')
        }
    }

    if (dto.teacherId && dto.teacherId !== existsGroup.teacherId) {
        const teacher = await this.db.user.findUnique({ where: { id: dto.teacherId } })
        if (teacher?.role !== Roles.TEACHER) {
            throw new BadRequestException(`Berilgan id O'qituvchiga tegishli emas`)
        }
    }

    const updated = await this.db.groups.update({
        where: { id },
        data: dto
    })

    return successRes(updated)
}

    async remove(id: number) {
    if (!await this.db.groups.findUnique({ where: { id } })) {
        throw new NotFoundException('Bunday guruh topilmadi')
    }
    await this.db.groups.delete({ where: { id } })
    return successRes({})
}
}