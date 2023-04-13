import { ApiProperty } from '@nestjs/swagger';

export class UserBanInfoModel {
  @ApiProperty()
  isBanned: boolean;

  @ApiProperty({ type: Date, nullable: true })
  banDate: string | null;

  @ApiProperty({ type: String, nullable: true })
  banReason: string | null;
}

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
