import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AccessRoles } from "../../common/decorator/roles.decorator";
import { Roles } from "../../common/enum";
import { GroupsService } from "./groups.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";

@ApiBearerAuth()
@AccessRoles(Roles.ADMIN)
@Controller('groups')
export class GroupController{
    constructor(private readonly groupsService: GroupsService){}
    @Post()
    create(@Body() dto: CreateGroupDto){
        return this.groupsService.create(dto)
    }

    @Get()
    findAll() {
        return this.groupsService.findAll()
    }

    @Get(':id')
    findById(@Param('id', ParseIntPipe) id : number){
        return this.groupsService.findById(id)
    }

    @Patch(':id')
    update(
        @Param('id',ParseIntPipe) id: number,
        @Body() dto: UpdateGroupDto
    ){
        return this.groupsService.update(id,dto)
    }

    @Delete(':id')
    remove(@Param('id',ParseIntPipe) id : number){
        return this.groupsService.remove(id)
    }
}