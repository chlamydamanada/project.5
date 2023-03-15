import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesRepositoryToSA {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteAllUserDevices(userId: string) {
    await this.dataSource.query(
      `DELETE FROM public."device" WHERE "ownerId" = $1`,
      [userId],
    );
    return;
  }
}
