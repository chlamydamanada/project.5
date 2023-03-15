import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DevicesQueryRepository } from './qweryRepositories/deviceQwery.repository';
import { DeviceViewType } from '../devicesTypes/deviceViewType';
import { RefreshTokenGuard } from '../../auth/guards/refreshTokenAuth.guard';
import { UserInfoRtType } from '../../auth/types/userIdDeviceIdType';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteDeviceCommand } from '../useCases/deleteDevice.useCase';
import { DeleteAllDevicesExceptThisCommand } from '../useCases/deleteAllDevicesExceptThis.useCase';
import { CurrentUserInfoAndDeviceId } from '../../../../helpers/decorators/currentUserIdDeviceId';

@Controller('security')
export class DevicesController {
  constructor(
    private readonly devicesQueryRepository: DevicesQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get('devices')
  @UseGuards(RefreshTokenGuard)
  async getAllDevicesByUserId(
    @CurrentUserInfoAndDeviceId() user: UserInfoRtType,
  ): Promise<DeviceViewType[]> {
    const allDevices = await this.devicesQueryRepository.findDevicesByUserId(
      user.id,
    );
    if (!allDevices) throw new NotFoundException('Can`t find your devices');
    return allDevices;
  }

  @Delete('devices')
  @HttpCode(204)
  @UseGuards(RefreshTokenGuard)
  async deleteAllDevicesByIdExceptThis(
    @CurrentUserInfoAndDeviceId() user: UserInfoRtType,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteAllDevicesExceptThisCommand(user.id, user.deviceId),
    );
    return;
  }

  @Delete('devices/:deviceId')
  @HttpCode(204)
  @UseGuards(RefreshTokenGuard)
  async deleteDeviceById(
    @CurrentUserInfoAndDeviceId() user: UserInfoRtType,
    @Param('deviceId') deviceId: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteDeviceCommand(deviceId, user.id));
    return;
  }
}
