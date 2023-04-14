import { ApiProperty } from '@nestjs/swagger';

export class BlogBanInfoModel {
  @ApiProperty()
  isBanned: boolean;

  @ApiProperty({ nullable: true, type: Date })
  banDate: string | null;
}
