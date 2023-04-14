import { newestLikesForPostModel } from './newestLikesForPostModel';
import { ApiProperty } from '@nestjs/swagger';

export class extendedLikesInfoModel {
  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  dislikesCount: number;

  @ApiProperty({ default: 'None' })
  myStatus: string;

  @ApiProperty({ isArray: true, type: newestLikesForPostModel })
  newestLikes: newestLikesForPostModel[];
}
