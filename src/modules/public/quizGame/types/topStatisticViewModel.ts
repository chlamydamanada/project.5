import { ApiProperty } from '@nestjs/swagger';
import { PlayerInfoViewModel } from './playerInfoViewModel';
import { TopStatisticDtoType } from './topStatisticDtoType';
import { CurrentStatisticViewModel } from './currentStatisticViewModel';

export class TopStatisticViewModel extends CurrentStatisticViewModel {
  @ApiProperty()
  player: PlayerInfoViewModel;

  constructor(statisticDto: TopStatisticDtoType) {
    super(statisticDto);
    this.player = statisticDto.player;
  }
}
