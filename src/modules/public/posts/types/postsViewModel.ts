import { postViewModel } from './postViewModel';
import { ApiProperty } from '@nestjs/swagger';

export class postsViewModel {
  @ApiProperty()
  pagesCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ isArray: true, type: postViewModel })
  items: postViewModel[];
}
