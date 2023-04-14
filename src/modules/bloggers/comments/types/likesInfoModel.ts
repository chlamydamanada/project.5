import { ApiProperty } from '@nestjs/swagger';

export class LikesInfoModel {
  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  dislikesCount: number;

  @ApiProperty()
  myStatus: string;
}
