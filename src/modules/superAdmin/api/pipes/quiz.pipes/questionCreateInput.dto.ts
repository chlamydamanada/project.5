import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class QuestionCreateInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  body: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @ArrayMinSize(1)
  correctAnswers: string[];
}
