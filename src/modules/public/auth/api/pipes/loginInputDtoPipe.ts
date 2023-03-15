import { IsNotEmpty, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class loginInputModelPipe {
  @IsNotEmpty()
  @Length(3, 50)
  @Transform(({ value }) => value?.trim())
  loginOrEmail: string;

  @IsNotEmpty()
  @Length(6, 20)
  @Transform(({ value }) => value?.trim())
  password: string;
}
