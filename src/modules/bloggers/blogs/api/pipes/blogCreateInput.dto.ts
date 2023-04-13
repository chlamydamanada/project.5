import { IsNotEmpty, IsString, IsUrl, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class blogCreateInputDto {
  @ApiProperty()
  @Length(3, 15)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @ApiProperty()
  @Length(3, 500)
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  description: string;

  @ApiProperty()
  @IsUrl()
  @Length(5, 100)
  @IsNotEmpty()
  @IsString()
  //@Matches(/^[a-zA-Z]+$/) //can use regex: only english letters
  websiteUrl: string;
}
