import { IsBoolean, IsNotEmpty } from 'class-validator';

export class BanOrUnbanBlogPipe {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
