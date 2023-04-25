import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../auth/repositories/users.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { QuizGamePublicRepository } from '../repositories/quizGame.repository';
import { PlayerProgress } from '../domain/player.entity';
import { v4 as uuidv4 } from 'uuid';
import { Game } from '../domain/game.entity';
import { GameStatusModel } from '../types/gameStatusType';
import { QuestionOfGame } from '../domain/questionOfGame.entity';

export class ConnectionToGameCommand {
  constructor(public userId: string) {}
}
@CommandHandler(ConnectionToGameCommand)
export class ConnectionToGameUseCase
  implements ICommandHandler<ConnectionToGameCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly quizGameRepository: QuizGamePublicRepository,
  ) {}
  async execute(command: ConnectionToGameCommand): Promise<string> {
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) throw new NotFoundException('The user with this id not found');

    //find game which user has not finished
    const activeGame = await this.quizGameRepository.findActiveGameByUserId(
      command.userId,
    );
    if (activeGame)
      throw new ForbiddenException(
        'You should finish the current game before starting a new one',
      );

    //find game with status PendingSecondPlayer
    const pendingGame = await this.quizGameRepository.findPendingGame();
    if (pendingGame) {
      //check user try join to game twice
      if (pendingGame.firstPlayerProgress.playerId === command.userId)
        throw new ForbiddenException('You should wait for the second player');

      //create 5 random questions
      const questions = await this.createQuestionsForGame(pendingGame.id);
      //create second player
      const playerId = await this.createPlayer(pendingGame.id, user.id);
      //change game status and start game
      pendingGame.status = GameStatusModel.active;
      pendingGame.startGameDate = new Date();
      pendingGame.secondPlayerProgressId = playerId;
      pendingGame.questions = questions;
      //save game
      await this.quizGameRepository.saveGame(pendingGame);
      return pendingGame.id;
    }
    //create game id
    const gameId = uuidv4();
    //create first player
    const playerId = await this.createPlayer(gameId, user.id);
    //create new game(status pending)
    const newGame = new Game();
    newGame.id = gameId;
    newGame.firstPlayerProgressId = playerId;
    //save game
    await this.quizGameRepository.saveGame(newGame);
    return gameId;
  }

  private async createQuestionsForGame(
    gameId: string,
  ): Promise<QuestionOfGame[]> {
    const questions = await this.quizGameRepository.getSeveralRandomQuestions(
      5,
    );
    if (questions.length === 0)
      throw new NotFoundException(
        'Not found questions for game. Try join to game later',
      );
    // save questions for game
    const result = questions.map((q) => {
      const questionOfGame = new QuestionOfGame();
      questionOfGame.questionId = q.id;
      questionOfGame.gameId = gameId;
      return questionOfGame;
    });

    return this.quizGameRepository.saveQuestionsOfGame(result);
  }

  private async createPlayer(gameId: string, userId: string): Promise<string> {
    const player = new PlayerProgress();
    player.gameId = gameId;
    player.playerId = userId;
    const playerId = await this.quizGameRepository.savePlayer(player);
    return playerId;
  }
}
