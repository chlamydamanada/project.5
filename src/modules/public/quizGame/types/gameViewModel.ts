import { GameStatusModel } from './gameStatusType';
import { QuestionOfGameViewModel } from './questionOfGameViewModel';
import { PlayerViewModel } from './playerViewModel';

export class GameViewModel {
  id: string;
  status: GameStatusModel;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
  questions: QuestionOfGameViewModel[] | null;
  firstPlayerProgress: PlayerViewModel;
  secondPlayerProgress: PlayerViewModel | null;
}
