import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class blogUpdateInputDto {
  @ApiProperty()
  @Length(3, 15)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  //@Matches(/^[a-zA-Z]+$/) //can use regex: only english letters
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
  websiteUrl: string;
}
