import { ApiProperty } from '@nestjs/swagger';

export class CommentatorInfo {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userLogin: string;
}

export class LikesInfo {
  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  dislikesCount: number;

  @ApiProperty()
  myStatus: string;
}

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
