import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class postUpdateInputDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 30)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  shortDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 1000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  content: string;
}
