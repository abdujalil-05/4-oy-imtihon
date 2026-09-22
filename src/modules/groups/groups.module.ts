import { Module } from "@nestjs/common";
import { GroupsService } from "./groups.service";
import { GroupController } from "./groups.controller";

@Module({
    providers: [GroupsService],
    controllers: [GroupController]
})
export class GroupsModule {}