import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { UserId } from '../../common/decorator/current-user.decorator';
import { AuthGuard } from '../../common/guard/jwt-auth.guard';
import { RefreshToken } from '../../common/decorator/get-cookie.decorator';

@UseGuards(AuthGuard)
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  findAll(@UserId() userId: number) {
    return this.deviceService.findAll(userId);
  }

  @Delete(':id')
  remove(
    @RefreshToken() refreshToken: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.deviceService.remove(refreshToken, id);
  }
}
