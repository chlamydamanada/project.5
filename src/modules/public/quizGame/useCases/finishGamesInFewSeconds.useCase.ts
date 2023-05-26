import { QuizGamePublicRepository } from '../repositories/quizGame.repository';
import { GameStatusModel } from '../types/gameStatusType';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';

export class FinishGamesInFewSecondsCommand {}

@CommandHandler(FinishGamesInFewSecondsCommand)
export class FinishGamesInFewSecondsUseCase
  implements ICommandHandler<FinishGamesInFewSecondsCommand>
{
  constructor(private readonly quizGameRepository: QuizGamePublicRepository) {}

  @Cron(CronExpression.EVERY_SECOND)
  async execute(): Promise<void> {
    //find games, which should be finished
    const gamesToBeFinished =
      await this.quizGameRepository.getGamesToBeFinished();

    //change status of game to finished and save
    if (gamesToBeFinished.length > 0) {
      gamesToBeFinished.map(async (g) => {
        g.status = GameStatusModel.finished;
        g.finishGameDate = new Date();
        await this.quizGameRepository.saveGame(g);
        return;
      });
    }
    return;
  }
}
