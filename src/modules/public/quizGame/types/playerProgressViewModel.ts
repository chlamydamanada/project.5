import { AnswerViewModel } from './answerViewModel';
import { PlayerInfoViewModel } from './playerInfoViewModel';
import { ApiProperty } from '@nestjs/swagger';

export class PlayerProgressViewModel {
  @ApiProperty({
    isArray: true,
    type: AnswerViewModel,
  })
  answers: AnswerViewModel[];

  @ApiProperty()
  player: PlayerInfoViewModel;

  @ApiProperty()
  score: number;
}
