import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class commentInputDtoPipe {
  @IsNotEmpty()
  @IsString()
  @Length(20, 300)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  content: string;
}
