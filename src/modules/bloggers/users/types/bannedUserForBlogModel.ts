import { ApiProperty } from '@nestjs/swagger';
import { BanInfoModel } from './banInfoModel';

export class BannedUserForBlogModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty({ type: BanInfoModel })
  banInfo: BanInfoModel;
}
