import { ApiProperty } from '@nestjs/swagger';
import { StatisticDtoType } from './statisticDtoType';

export class CurrentStatisticViewModel {
  @ApiProperty()
  sumScore: number;

  @ApiProperty()
  avgScores: number;

  @ApiProperty()
  gamesCount: number;

  @ApiProperty()
  winsCount: number;

  @ApiProperty()
  lossesCount: number;

  @ApiProperty()
  drawsCount: number;

  constructor(statisticDto: StatisticDtoType) {
    this.sumScore = Number(statisticDto.sumScore ?? 0);
    this.gamesCount = Number(statisticDto.gamesCount);
    this.winsCount = Number(statisticDto.winsCount);
    this.lossesCount = Number(statisticDto.lossesCount);
    this.drawsCount = Number(statisticDto.drawsCount);
    this.avgScores =
      Number(statisticDto.avgScores) === Math.floor(+statisticDto.avgScores)
        ? Math.floor(+statisticDto.avgScores)
        : Math.round(+statisticDto.avgScores * 100) / 100;
  }
}
