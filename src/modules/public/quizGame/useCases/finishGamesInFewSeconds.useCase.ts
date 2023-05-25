import { QuizGamePublicRepository } from '../repositories/quizGame.repository';
import { GameStatusModel } from '../types/gameStatusType';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class FinishGamesInFewSecondsCommand {}

@CommandHandler(FinishGamesInFewSecondsCommand)
export class FinishGamesInFewSecondsUseCase
  implements ICommandHandler<FinishGamesInFewSecondsCommand>
{
  constructor(private readonly quizGameRepository: QuizGamePublicRepository) {}

  async execute(): Promise<void> {
    console.log('start useCase', this);
    //find games, which should be finished
    const gamesToBeFinished =
      await this.quizGameRepository.getGamesToBeFinished();

    if (gamesToBeFinished.length > 0) {
      //change status of game to finished and save
      gamesToBeFinished.map(async (g) => {
        g.status = GameStatusModel.finished;
        await this.quizGameRepository.saveGame(g);
        return;
      });
    }
    return;
  }
}
