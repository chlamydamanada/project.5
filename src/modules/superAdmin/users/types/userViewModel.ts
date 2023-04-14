import { ApiProperty } from '@nestjs/swagger';
import { UserBanInfoModel } from './userBanInfoModel';

export class UserViewModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  banInfo: UserBanInfoModel;
}
