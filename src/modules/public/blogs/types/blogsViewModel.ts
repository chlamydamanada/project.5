import { blogViewModel } from './blogViewModel';
import { ApiProperty } from '@nestjs/swagger';

export class blogsViewModel {
  @ApiProperty()
  pagesCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ isArray: true, type: blogViewModel })
  items: blogViewModel[];
}
