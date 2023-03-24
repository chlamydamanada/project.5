import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class BanStatusByBloggerPipe {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;

  @IsNotEmpty()
  @Length(20, 200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  banReason: string;

  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  blogId: string;
}
