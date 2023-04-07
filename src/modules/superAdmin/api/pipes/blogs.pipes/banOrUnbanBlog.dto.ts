import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BanOrUnbanBlogDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
