import { QuizGamePublicRepository } from '../repositories/quizGame.repository';
import { GameStatusModel } from '../types/gameStatusType';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PlayerProgress } from '../domain/player.entity';
import { AnswerStatusType } from '../types/answerStatusType';
import { addSeconds } from 'date-fns';
import { Game } from '../domain/game.entity';

export class FinishGamesInFewSecondsCommand {}

@CommandHandler(FinishGamesInFewSecondsCommand)
export class FinishGamesInFewSecondsUseCase
  implements ICommandHandler<FinishGamesInFewSecondsCommand>
{
  constructor(private readonly quizGameRepository: QuizGamePublicRepository) {}

  @Cron(CronExpression.EVERY_SECOND)
  async execute(): Promise<void> {
    //find games, which should be finished
    const gamesToBeFinished = await this.quizGameRepository.getAllActiveGames();

    //change status of game to finished and save

    gamesToBeFinished.map(async (g) => {
      if (
        g.firstPlayerProgress.answers.length === g.questions?.length &&
        g.firstPlayerProgress.answers[0].addedAt < addSeconds(new Date(), -5)
      ) {
        await this.addBonusPoint(g.firstPlayerProgress);
        await this.finishedGame(g);
        return;
      }
      if (
        g.secondPlayerProgress?.answers.length === g.questions?.length &&
        g.secondPlayerProgress!.answers[0].addedAt < addSeconds(new Date(), -5)
      ) {
        await this.addBonusPoint(g.firstPlayerProgress);
        await this.finishedGame(g);
        return;
      }
      return;
    });
    return;
  }
  private async addBonusPoint(player: PlayerProgress) {
    console.log('USECASE:', player, player.answers);
    player.answers.find((e) => e.answerStatus === AnswerStatusType.Correct)
      ? (player.score += 1)
      : (player.score += 0);

    await this.quizGameRepository.savePlayer(player);
    return;
  }

  private async finishedGame(game: Game) {
    game.status = GameStatusModel.finished;
    game.finishGameDate = new Date();
    await this.quizGameRepository.saveGame(game);
    return;
  }
}
