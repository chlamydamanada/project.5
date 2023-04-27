import { ApiProperty } from '@nestjs/swagger';

export class PlayerInfoViewModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;
}
