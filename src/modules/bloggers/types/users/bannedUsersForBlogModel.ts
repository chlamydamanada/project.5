import { ApiProperty } from '@nestjs/swagger';

export class BanInfoModel {
  @ApiProperty()
  isBanned: boolean;

  @ApiProperty()
  banDate: Date;

  @ApiProperty()
  banReason: string;
}

export class BannedUserForBlogModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty({ type: BanInfoModel })
  banInfo: BanInfoModel;
}

export class BannedUsersForBlogModel {
  @ApiProperty()
  pagesCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ isArray: true, type: BannedUserForBlogModel })
  items: BannedUserForBlogModel[];
}
