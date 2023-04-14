import { ApiProperty } from '@nestjs/swagger';

export class BanInfoModel {
  @ApiProperty()
  isBanned: boolean;

  @ApiProperty()
  banDate: Date;

  @ApiProperty()
  banReason: string;
}
