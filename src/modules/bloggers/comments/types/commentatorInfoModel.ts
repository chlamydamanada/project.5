import { ApiProperty } from '@nestjs/swagger';

export class CommentatorInfoModel {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userLogin: string;
}
