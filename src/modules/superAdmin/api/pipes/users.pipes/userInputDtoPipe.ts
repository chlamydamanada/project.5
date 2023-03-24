import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class userInputModelPipe {
  @IsNotEmpty()
  @Length(3, 10)
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  login: string;

  @IsNotEmpty()
  @Length(6, 20)
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email: string;
}
