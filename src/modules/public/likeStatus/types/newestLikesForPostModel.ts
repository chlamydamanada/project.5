import { ApiProperty } from '@nestjs/swagger';

export class newestLikesForPostModel {
  @ApiProperty()
  addedAt: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  login: string;
}
