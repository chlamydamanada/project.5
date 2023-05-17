import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGamePublicRepository } from '../repositories/quizGame.repository';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Question } from '../../../superAdmin/quizQuestions/domain/question.entity';
import { PlayerProgress } from '../domain/player.entity';
import { Game } from '../domain/game.entity';
import { Answer } from '../domain/answer.entity';
import { AnswerStatusType } from '../types/answerStatusType';
import { v4 as uuidv4 } from 'uuid';
import { GameStatusModel } from '../types/gameStatusType';

export class CreateAnswerOfCurrentUserCommand {
  constructor(public userId: string, public answer: string) {}
}
@CommandHandler(CreateAnswerOfCurrentUserCommand)
export class CreateAnswerOfCurrentUserUseCase
  implements ICommandHandler<CreateAnswerOfCurrentUserCommand>
{
  constructor(private readonly quizGameRepository: QuizGamePublicRepository) {}
  async execute(command: CreateAnswerOfCurrentUserCommand): Promise<string> {
    //check does user have active game
    const activeGame = await this.quizGameRepository.findActiveGameByUserId(
      command.userId,
    );
    if (!activeGame)
      throw new ForbiddenException('You haven`t active games for now');

    // get current user
    const currentPlayer = this.getCurrentPlayer(activeGame, command.userId);

    // check if user has answered all questions
    if (currentPlayer.answers.length === activeGame.questions?.length) {
      // if user has answered all questions
      throw new ForbiddenException(
        'You already answered all the questions and finished game',
      );
    }
    //create and save new answer of user and change score of player
    const newAnswerId = await this.addAnswerToPlayer(
      activeGame,
      currentPlayer,
      command.answer,
    );

    //second step of game: check is game finished(players should answer all questions)
    const isFinished = this.isGameFinished(activeGame);

    //if game finished -> third step
    if (isFinished) {
      //third step: change status of game, add bonus to player
      this.addBonusPoint(activeGame);
      activeGame.status = GameStatusModel.finished;
      activeGame.finishGameDate = new Date();
    }
    //save users changes
    await Promise.all([
      this.quizGameRepository.savePlayer(activeGame.firstPlayerProgress),
      this.quizGameRepository.savePlayer(activeGame.secondPlayerProgress!),
    ]);

    //await this.quizGameRepository.savePlayer(currentPlayer);

    //save game changes
    await this.quizGameRepository.saveGame(activeGame);

    return newAnswerId;
  }

  private getCurrentPlayer(activeGame: Game, userId: string): PlayerProgress {
    if (
      activeGame.secondPlayerProgress &&
      activeGame.secondPlayerProgress.userId === userId
    ) {
      return activeGame.secondPlayerProgress;
    }
    return activeGame.firstPlayerProgress;
  }

  private async addAnswerToPlayer(
    game: Game,
    player: PlayerProgress,
    answer: string,
  ): Promise<string> {
    // find current question
    if (!game.questions)
      throw new InternalServerErrorException('The game haven`t questions');
    const currentQuestion = game.questions[player.answers.length];

    // check is answer correct
    const isCorrectAnswer = this.isAnswerCorrect(
      answer,
      currentQuestion.question,
    );

    //create new answer
    const newAnswer = new Answer();
    newAnswer.id = uuidv4();
    newAnswer.body = answer;
    newAnswer.playerId = player.id;
    newAnswer.questionId = currentQuestion.question.id;
    newAnswer.answerStatus = isCorrectAnswer
      ? AnswerStatusType.Correct
      : AnswerStatusType.Incorrect;
    newAnswer.addedAt = new Date();

    await this.quizGameRepository.saveAnswer(newAnswer);

    // add answer to player and if answer is correct change score of player
    player.answers.push(newAnswer);
    isCorrectAnswer ? (player.score += 1) : (player.score += 0);

    return newAnswer.id;
  }

  private isAnswerCorrect(answer: string, question: Question): boolean {
    if (question.correctAnswers.find((a) => a === answer)) return true;
    return false;
  }

  private isGameFinished(game: Game): boolean {
    return (
      game.questions?.length === game.firstPlayerProgress.answers.length &&
      game.questions?.length === game.secondPlayerProgress?.answers.length
    );
  }

  private addBonusPoint(game: Game): void {
    // sort first player`s answers by date: last answer will be first(like desc)
    const answersOfFirstPlayer = game.firstPlayerProgress.answers.sort(
      (a, b) => Number(b.addedAt) - Number(a.addedAt),
    );
    // sort first player`s answers by date: last answer will be first(like desc)
    const answersOfSecondPlayer = game.secondPlayerProgress!.answers.sort(
      (a, b) => Number(b.addedAt) - Number(a.addedAt),
    );

    //check add one bonus point to first player or not(have one correct answer)
    if (answersOfFirstPlayer[0].addedAt < answersOfSecondPlayer[0].addedAt) {
      this.doesCorrectAnswerExist(answersOfFirstPlayer)
        ? (game.firstPlayerProgress.score += 1)
        : (game.firstPlayerProgress.score += 0);
      return;
    }

    //check add one bonus point to second player or not(have one correct answer)
    if (
      answersOfSecondPlayer[0].addedAt < answersOfFirstPlayer[0].addedAt &&
      game.secondPlayerProgress
    ) {
      this.doesCorrectAnswerExist(answersOfSecondPlayer)
        ? (game.secondPlayerProgress.score += 1)
        : (game.secondPlayerProgress.score += 0);
      return;
    }
    return;
  }
  private doesCorrectAnswerExist(answers: Answer[]): boolean {
    return !!answers.find((e) => e.answerStatus === AnswerStatusType.Correct);
  }
}
