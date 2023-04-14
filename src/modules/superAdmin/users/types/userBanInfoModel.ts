import { ApiProperty } from '@nestjs/swagger';

export class UserBanInfoModel {
  @ApiProperty()
  isBanned: boolean;

  @ApiProperty({ type: Date, nullable: true })
  banDate: string | null;

  @ApiProperty({ type: String, nullable: true })
  banReason: string | null;
}
