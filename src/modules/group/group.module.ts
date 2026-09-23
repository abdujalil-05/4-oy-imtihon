// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Guruhlar xizmati
import { GroupService } from './group.service';
// Guruhlar kontrolleri
import { GroupController } from './group.controller';

// Guruhlar moduli
@Module({
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
