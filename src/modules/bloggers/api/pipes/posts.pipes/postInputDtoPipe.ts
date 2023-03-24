import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class postInputModelIdPipe {
  @IsNotEmpty()
  @Length(1, 30)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  title: string;

  @IsNotEmpty()
  @Length(1, 100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  shortDescription: string;

  @IsNotEmpty()
  @Length(1, 1000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  content: string;

  /*@IsBlogExist()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @IsAlphanumeric() //Checks if the string contains only letters and numbers.
  @IsString()
  blogId: string;*/
}
