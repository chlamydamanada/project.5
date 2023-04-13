import { CommentViewModel } from './commentViewModel';
import { ApiProperty } from '@nestjs/swagger';

export class CommentsViewModel {
  @ApiProperty()
  pagesCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ isArray: true, type: CommentViewModel })
  items: CommentViewModel[];
}
