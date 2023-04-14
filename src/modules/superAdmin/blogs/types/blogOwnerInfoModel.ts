import { ApiProperty } from '@nestjs/swagger';

export class BlogOwnerInfoModel {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userLogin: string;
}
