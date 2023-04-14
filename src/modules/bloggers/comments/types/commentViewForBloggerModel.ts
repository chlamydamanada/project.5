import { ApiProperty } from '@nestjs/swagger';
import { PostInfoModel } from './postInfoModel';
import { CommentatorInfoModel } from './commentatorInfoModel';
import { LikesInfoModel } from './likesInfoModel';

export class CommentViewForBloggerModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: CommentatorInfoModel })
  commentatorInfo: CommentatorInfoModel;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: PostInfoModel })
  postInfo: PostInfoModel;

  @ApiProperty({ type: LikesInfoModel })
  likesInfo: LikesInfoModel;
}
