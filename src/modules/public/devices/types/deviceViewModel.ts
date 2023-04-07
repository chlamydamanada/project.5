import { ApiProperty } from '@nestjs/swagger';

export class DeviceViewModel {
  @ApiProperty()
  ip: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  lastActiveDate: string;

  @ApiProperty()
  deviceId: string;
}
