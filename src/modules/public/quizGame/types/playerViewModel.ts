import { AnswerViewModel } from './answerViewModel';
import { PlayerInfoViewModel } from './playerInfoViewModel';

export class PlayerViewModel {
  answers: AnswerViewModel[] | null;
  player: PlayerInfoViewModel;
  score: number;
}
