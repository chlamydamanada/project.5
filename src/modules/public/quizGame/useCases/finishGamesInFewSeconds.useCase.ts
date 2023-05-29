import { QuizGamePublicRepository } from '../repositories/quizGame.repository';
import { GameStatusModel } from '../types/gameStatusType';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PlayerProgress } from '../domain/player.entity';
import { AnswerStatusType } from '../types/answerStatusType';

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
        if (g.firstPlayerProgress.answers.length === g.questions?.length) {
          await this.addBonusPoint(g.firstPlayerProgress);
        }
        if (g.secondPlayerProgress?.answers.length === g.questions?.length) {
          await this.addBonusPoint(g.firstPlayerProgress);
        }
        g.status = GameStatusModel.finished;
        g.finishGameDate = new Date();
        await this.quizGameRepository.saveGame(g);
        return;
      });
    }
    return;
  }
  private async addBonusPoint(player: PlayerProgress) {
    console.log(player);
    player.answers.find((e) => e.answerStatus === AnswerStatusType.Correct)
      ? (player.score += 1)
      : (player.score += 0);

    await this.quizGameRepository.savePlayer(player);
    return;
  }
}
