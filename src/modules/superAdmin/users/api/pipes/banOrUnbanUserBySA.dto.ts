import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BanOrUnbanUserBySADto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(20, 200)
  @IsString()
  banReason: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
