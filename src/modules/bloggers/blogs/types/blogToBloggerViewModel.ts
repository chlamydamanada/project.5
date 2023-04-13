import { ApiProperty } from '@nestjs/swagger';

export class BlogToBloggerViewModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  websiteUrl: string;

  @ApiProperty()
  createdAt: Date; // but it is string

  @ApiProperty()
  isMembership: boolean;
}
