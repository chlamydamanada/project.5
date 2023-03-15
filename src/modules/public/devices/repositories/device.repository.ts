import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createDevice(
    deviceId: string,
    deviceIp: string,
    deviceTitle: string,
    ownerId: string,
    lastActiveDate: string,
    expirationDate: string,
  ): Promise<void> {
    await this.dataSource.query(
      `
INSERT INTO public.device(
"deviceId", "deviceIp", "deviceTitle", "lastActiveDate", "expirationDate", "ownerId")
VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        deviceId,
        deviceIp,
        deviceTitle,
        lastActiveDate,
        expirationDate,
        ownerId,
      ],
    );
    return;
  }

  async updateDevice(
    deviceId: string,
    ip: string,
    title: string,
    lastActiveDate: number,
    expirationDate: number,
  ): Promise<void> {
    await this.dataSource.query(
      ` UPDATE public."device"
SET , "deviceIp"= $1, "deviceTitle"= $2, "lastActiveDate"= $3, "expirationDate"= $4
WHERE "deviceId"= $5`,
      [ip, title, lastActiveDate, expirationDate, deviceId],
    );
    return;
  }

  async findDeviceByDeviceId(deviceId: string): Promise<null | {
    deviceId: string;
    lastActiveDate: number;
    ownerId: string;
  }> {
    const device = await this.dataSource.query(
      `
SELECT "deviceId", "lastActiveDate", "ownerId" FROM public."device"
WHERE "deviceId" = $1`,
      [deviceId],
    );
    if (device.length < 1) return null;
    return device[0];
  }

  async deleteDeviceByDeviceId(deviceId: string): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM public."device" WHERE "deviceId" = $1`,
      [deviceId],
    );
    return;
  }

  async deleteAllDevicesByIdExceptThis(userId: string, deviceId: string) {
    await this.dataSource.query(
      `DELETE FROM public."device"
WHERE "ownerId" = $1 AND "deviceId" NOT IN ($2)`,
      [userId, deviceId],
    );
    return;
  }
}
