import { StatisticDtoType } from './statisticDtoType';

export type TopStatisticDtoType = StatisticDtoType & {
  player: {
    id: string;
    login: string;
  };
};
