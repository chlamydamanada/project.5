import { ApiProperty } from '@nestjs/swagger';
import { CommentatorInfo } from './commentatorInfo';
import { LikesInfo } from './likesInfo';

export class CommentViewModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: CommentatorInfo })
  commentatorInfo: CommentatorInfo;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: LikesInfo })
  likesInfo: LikesInfo;
}
