import { ApiProperty } from '@nestjs/swagger';

export class CommentatorInfo {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userLogin: string;
}
