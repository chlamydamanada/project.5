import { Injectable } from '@nestjs/common';
import { DeviceViewType } from '../../devicesTypes/deviceViewType';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findDevicesByUserId(userId: string): Promise<DeviceViewType[] | null> {
    const devices = await this.dataSource.query(
      `SELECT "deviceId", "deviceIp" as "ip", "deviceTitle" as "title", "lastActiveDate"
FROM public."device" WHERE "ownerId" = $1`,
      [userId],
    );
    if (devices.length < 1) return null;
    return devices;
  }
}
