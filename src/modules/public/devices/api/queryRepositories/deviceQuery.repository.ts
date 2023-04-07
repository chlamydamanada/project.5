import { Injectable } from '@nestjs/common';
import { DeviceViewModel } from '../../types/deviceViewModel';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Device } from '../../domain/device.entity';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
  ) {}

  async findDevicesByUserId(userId: string): Promise<DeviceViewModel[] | null> {
    const devices = await this.devicesRepository.find({
      select: {
        deviceId: true,
        deviceIp: true,
        deviceTitle: true,
        lastActiveDate: true,
      },
      where: {
        ownerId: userId,
      },
    });

    if (!devices) return null;
    return devices.map((d) => ({
      ip: d.deviceIp,
      title: d.deviceTitle,
      lastActiveDate: new Date(d.lastActiveDate * 1000).toISOString(),
      deviceId: d.deviceId,
    }));
  }
}
