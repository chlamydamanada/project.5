import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class EmailPipe {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  email: string;
}
