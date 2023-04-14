import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class loginInputDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  loginOrEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  password: string;
}
