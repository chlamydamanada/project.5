import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BanUserByBloggerInputDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @Length(20, 200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  banReason: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  blogId: string;
}
