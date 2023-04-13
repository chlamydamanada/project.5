import { ApiProperty } from '@nestjs/swagger';

export class BlogOwnerInfoModel {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userLogin: string;
}

export class BlogBanInfoModel {
  @ApiProperty()
  isBanned: boolean;

  @ApiProperty({ nullable: true, type: Date })
  banDate: string | null;
}

export class BlogSAModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  websiteUrl: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty()
  isMembership: boolean;

  @ApiProperty({ type: BlogOwnerInfoModel })
  blogOwnerInfo: BlogOwnerInfoModel;

  @ApiProperty({ type: BlogBanInfoModel })
  banInfo: BlogBanInfoModel;
}
