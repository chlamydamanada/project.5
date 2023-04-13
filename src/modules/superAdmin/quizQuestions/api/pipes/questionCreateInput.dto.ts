import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionCreateInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(10, 500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  body: string;

  @ApiProperty({
    isArray: true,
    type: String,
    description:
      'All variants of possible correct answers for current questions',
    example: ['six', 'шесть', '6'],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @ArrayMinSize(1)
  correctAnswers: string[];
}
