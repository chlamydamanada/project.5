import { ApiProperty } from '@nestjs/swagger';
import { BannedUserForBlogModel } from './bannedUserForBlogModel';

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
