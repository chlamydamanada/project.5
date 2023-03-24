import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';

export class BanStatusInputModelPipe {
  @IsNotEmpty()
  @Length(20, 200)
  @IsString()
  banReason: string;

  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
