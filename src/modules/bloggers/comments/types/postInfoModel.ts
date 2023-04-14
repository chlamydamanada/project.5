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
