// Modul yasash uchun Nest vositasi
import { Module } from '@nestjs/common';
// Xonalar xizmati
import { RoomService } from './room.service';
// Xonalar kontrolleri
import { RoomController } from './room.controller';

// Xonalar moduli
@Module({
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
