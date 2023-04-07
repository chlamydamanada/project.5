import { BlogSAModel } from './blogSAModel';
import { ApiProperty } from '@nestjs/swagger';

export class BlogsSAModel {
  @ApiProperty()
  pagesCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ isArray: true, type: BlogSAModel })
  items: BlogSAModel[];
}
