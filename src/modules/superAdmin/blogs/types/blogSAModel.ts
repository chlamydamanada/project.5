import { ApiProperty } from '@nestjs/swagger';
import { BlogOwnerInfoModel } from './blogOwnerInfoModel';
import { BlogBanInfoModel } from './blogBanInfoModel';

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
