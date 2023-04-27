import { GameViewModel } from './gameViewModel';
import { ApiProperty } from '@nestjs/swagger';

export class GamesViewModel {
  @ApiProperty()
  pagesCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ isArray: true, type: GameViewModel })
  items: GameViewModel[];
}
