import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../public/devices/domain/device.entity';

@Injectable()
export class DevicesRepositoryToSA {
  constructor(
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
  ) {}

  async deleteAllUserDevices(userId: string) {
    await this.devicesRepository.delete({ ownerId: userId });
    return;
  }
}
