import { GameStatusModel } from './gameStatusType';
import { QuestionOfGameViewModel } from './questionOfGameViewModel';
import { PlayerProgressViewModel } from './playerProgressViewModel';
import { ApiProperty } from '@nestjs/swagger';
import { SwaggerConstants } from '../../../../swagger/swagger.constants';

export class GameViewModel {
  @ApiProperty()
  id: string;

  @ApiProperty({
    type: String,
    enum: ['PendingSecondPlayer', 'Active', 'Finished'],
  })
  status: GameStatusModel;

  @ApiProperty({ description: SwaggerConstants.pairCreatedDate })
  pairCreatedDate: Date;

  @ApiProperty({
    nullable: true,
    type: Date,
    description: SwaggerConstants.startGameDate,
  })
  startGameDate: Date | null;

  @ApiProperty({
    nullable: true,
    type: Date,
    description: SwaggerConstants.finishGameDate,
  })
  finishGameDate: Date | null;

  @ApiProperty({
    nullable: true,
    isArray: true,
    type: QuestionOfGameViewModel,
    description: SwaggerConstants.questionsOfGame,
  })
  questions: QuestionOfGameViewModel[] | null;

  @ApiProperty()
  firstPlayerProgress: PlayerProgressViewModel;

  @ApiProperty({
    nullable: true,
    type: PlayerProgressViewModel,
    description: SwaggerConstants.secondPlayerProgress,
  })
  secondPlayerProgress: PlayerProgressViewModel | null;
}
