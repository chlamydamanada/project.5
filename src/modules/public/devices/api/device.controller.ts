import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DevicesQueryRepository } from './queryRepositories/deviceQuery.repository';
import { DeviceViewModel } from '../types/deviceViewModel';
import { RefreshTokenGuard } from '../../auth/guards/refreshTokenAuth.guard';
import { UserInfoRtType } from '../../auth/types/userIdDeviceIdType';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteDeviceCommand } from '../useCases/deleteDevice.useCase';
import { DeleteAllDevicesExceptThisCommand } from '../useCases/deleteAllDevicesExceptThis.useCase';
import { CurrentUserInfoAndDeviceId } from '../../../../helpers/decorators/currentUserIdDeviceId';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { GetUserDevicesSwaggerDecorator } from '../../../../swagger/decorators/public/devices/getUserDevices.swagger.decorator';
import { DeleteAllDevicesExceptThisSwaggerDecorator } from '../../../../swagger/decorators/public/devices/deleteAllDevicesExeptThis.swagger.decorator';
import { DeleteDeviceByIdSwaggerDecorator } from '../../../../swagger/decorators/public/devices/deleteDeviceById.swagger.decorator';

@ApiTags('Public Devices')
@ApiCookieAuth()
@Controller('security')
export class DevicesController {
  constructor(
    private readonly devicesQueryRepository: DevicesQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get('devices')
  @GetUserDevicesSwaggerDecorator()
  @UseGuards(RefreshTokenGuard)
  async getAllDevicesByUserId(
    @CurrentUserInfoAndDeviceId() user: UserInfoRtType,
  ): Promise<DeviceViewModel[]> {
    const allDevices = await this.devicesQueryRepository.findDevicesByUserId(
      user.id,
    );
    if (!allDevices) throw new NotFoundException('Can`t find your devices');
    return allDevices;
  }

  @Delete('devices')
  @DeleteAllDevicesExceptThisSwaggerDecorator()
  @HttpCode(204)
  @UseGuards(RefreshTokenGuard)
  async deleteAllDevicesByIdExceptThis(
    @CurrentUserInfoAndDeviceId() user: UserInfoRtType,
  ): Promise<void> {
    await this.commandBus.execute<DeleteAllDevicesExceptThisCommand>(
      new DeleteAllDevicesExceptThisCommand(user.id, user.deviceId),
    );
    return;
  }

  @Delete('devices/:deviceId')
  @DeleteDeviceByIdSwaggerDecorator()
  @HttpCode(204)
  @UseGuards(RefreshTokenGuard)
  async deleteDeviceById(
    @CurrentUserInfoAndDeviceId() user: UserInfoRtType,
    @Param('deviceId') deviceId: string,
  ): Promise<void> {
    await this.commandBus.execute<DeleteDeviceCommand>(
      new DeleteDeviceCommand(deviceId, user.id),
    );
    return;
  }
}
