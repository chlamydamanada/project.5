import { GameStatusModel } from './gameStatusType';

export type ActiveGameType = {
  id: string;
  status: GameStatusModel.active;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: null;
  firstPlayerProgressId: string;
  secondPlayerProgressId: string;
};
