import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CodePipe {
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  code: string;
}
