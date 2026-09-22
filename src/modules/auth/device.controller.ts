import { Controller, Delete, Get, Param, ParseUUIDPipe } from '@nestjs/common'; // HTTP
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; // Swagger
import { DeviceService } from './device.service'; // Servis
import { CurrentUser } from '../../common/decorator/current-user.decorator'; // req.user
import type { IUser } from '../../common/interface/IUser.interface'; // Tip

// Qurilmalar endpointlari (TZ 10.1, 7–8)
@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth/sessions')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  // GET /auth/sessions — o'z qurilmalari
  @Get()
  findAll(@CurrentUser() user: IUser) {
    return this.deviceService.findAll(user.sub, user.deviceId);
  }

  // DELETE /auth/sessions/:id — bitta qurilmani uzish (UUID emas → 400)
  @Delete(':id')
  remove(@CurrentUser() user: IUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.deviceService.remove(user.sub, id);
  }
}
