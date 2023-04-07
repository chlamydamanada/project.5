import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class userCreateInputDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 10)
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  login: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 20)
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email: string;
}
