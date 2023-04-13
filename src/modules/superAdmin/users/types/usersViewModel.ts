import { UserViewModel } from './userViewType';
import { ApiProperty } from '@nestjs/swagger';

export class UsersViewModel {
  @ApiProperty()
  pagesCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ isArray: true, type: UserViewModel })
  items: UserViewModel[];
}
