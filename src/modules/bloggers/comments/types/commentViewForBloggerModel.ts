import { ApiProperty } from '@nestjs/swagger';
export class PostInfoModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  blogId: string;

  @ApiProperty()
  blogName: string;
}

export class CommentatorInfoModel {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userLogin: string;
}

export class LikesInfoModel {
  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  dislikesCount: number;

  @ApiProperty()
  myStatus: string;
}

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
