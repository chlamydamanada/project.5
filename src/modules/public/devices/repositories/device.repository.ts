import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Device } from '../domain/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
  ) {}

  async saveDevice(device: Device): Promise<void> {
    await this.devicesRepository.save(device);
  }

  async updateDevice(
    deviceId: string,
    ip: string,
    title: string,
    lastActiveDate: number,
    expirationDate: number,
  ): Promise<void> {
    await this.devicesRepository.update(
      { deviceId: deviceId },
      { expirationDate: expirationDate, lastActiveDate: lastActiveDate },
    );
    return;
  }

  async findDeviceByDeviceId(deviceId: string): Promise<null | Device> {
    const device = await this.devicesRepository.findOneBy({
      deviceId: deviceId,
    });
    return device;
  }

  async deleteDeviceByDeviceId(deviceId: string): Promise<void> {
    await this.devicesRepository.delete({ deviceId: deviceId });
    return;
  }

  async deleteAllDevicesByIdExceptThis(userId: string, deviceId: string) {
    await this.devicesRepository.delete({
      ownerId: userId,
      deviceId: Not(deviceId),
    });
    return;
  }
}
