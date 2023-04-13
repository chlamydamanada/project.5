import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionUpdateInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(10, 500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  body: string;

  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @ArrayMinSize(1)
  correctAnswers: string[];
}
