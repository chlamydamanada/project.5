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
    return devices.map((d) => ({
      ip: d.ip,
      title: d.title,
      lastActiveDate: new Date(d.lastActiveDate * 1000).toISOString(),
      deviceId: d.deviceId,
    }));
  }
}
