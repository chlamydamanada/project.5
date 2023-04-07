import { CommentViewForBloggerModel } from './commentViewForBloggerModel';
import { ApiProperty } from '@nestjs/swagger';

export class CommentsViewForBloggerModel {
  @ApiProperty()
  pagesCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ isArray: true, type: CommentViewForBloggerModel })
  items: CommentViewForBloggerModel[];
}
