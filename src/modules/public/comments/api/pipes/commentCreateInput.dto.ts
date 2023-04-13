import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class commentCreateInputDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(20, 300)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  content: string;
}
