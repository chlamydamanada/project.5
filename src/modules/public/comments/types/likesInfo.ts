import { ApiProperty } from '@nestjs/swagger';

export class LikesInfo {
  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  dislikesCount: number;

  @ApiProperty({
    enum: ['None', 'Like', 'Dislike'],
    type: String,
  })
  myStatus: string;
}
