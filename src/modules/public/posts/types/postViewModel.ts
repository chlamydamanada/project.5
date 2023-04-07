import { extendedLikesInfoModel } from '../../likeStatus/types/extendedLikesInfoOfPostType';
import { ApiProperty } from '@nestjs/swagger';

export class postViewModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  blogId: string;

  @ApiProperty()
  blogName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: extendedLikesInfoModel })
  extendedLikesInfo: extendedLikesInfoModel;
}
