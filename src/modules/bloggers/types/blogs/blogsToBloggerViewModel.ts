import { BlogToBloggerViewModel } from './blogToBloggerViewModel';
import { ApiProperty } from '@nestjs/swagger';

export class BlogsToBloggerViewModel {
  @ApiProperty()
  pagesCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ isArray: true, type: BlogToBloggerViewModel })
  items: BlogToBloggerViewModel[];
}
