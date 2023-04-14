import { ApiProperty } from '@nestjs/swagger';

export class MeViewModel {
  @ApiProperty()
  email: string;

  @ApiProperty()
  login: string;

  @ApiProperty()
  userId: string;
}
