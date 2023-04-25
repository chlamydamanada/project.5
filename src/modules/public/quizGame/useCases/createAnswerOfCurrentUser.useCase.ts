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

    // first step of game: check answer, create and save it, change score of player
    let newAnswerId: string;

    if (
      activeGame.secondPlayerProgress?.playerId === command.userId &&
      activeGame.secondPlayerProgress.answers?.length !==
        activeGame.questions?.length
    ) {
      newAnswerId = this.addAnswerToPlayer(
        activeGame,
        activeGame.secondPlayerProgress,
        command.answer,
      );
    } else if (
      activeGame.firstPlayerProgress.playerId === command.userId &&
      activeGame.firstPlayerProgress.answers?.length !==
        activeGame.questions?.length
    ) {
      newAnswerId = this.addAnswerToPlayer(
        activeGame,
        activeGame.firstPlayerProgress,
        command.answer,
      );
    } else {
      // if user isn`t player of this game or user has answered all questions
      throw new ForbiddenException(
        'You already answered all the questions and finished game',
      );
    }
    //second step of game: check is game finished(players should answer all questions)
    const isFinished = this.isGameFinished(activeGame);

    //if game finished -> third step
    if (isFinished) {
      //third step: change status of game, add bonus to player
      this.addBonusPoint(activeGame);
      activeGame.status = GameStatusModel.finished;
      activeGame.finishGameDate = new Date();
    }

    //save game changes
    await this.quizGameRepository.saveGame(activeGame);

    //console.log('*GAME*', activeGame);
    return newAnswerId;
  }
  private addAnswerToPlayer(
    game: Game,
    player: PlayerProgress,
    answer: string,
  ): string {
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
    newAnswer.playerId = player.playerId;
    newAnswer.questionId = currentQuestion.questionId;
    newAnswer.answerStatus = isCorrectAnswer
      ? AnswerStatusType.Correct
      : AnswerStatusType.Incorrect;
    newAnswer.addedAt = new Date();

    // add answer to player and if answer is correct change score of player
    player.answers.push(newAnswer);
    isCorrectAnswer ? (player.score += 1) : (player.score += 0);

    // console.log(
    //   '++FIRST:',
    //   game.firstPlayerProgress.answers,
    //   '++SECOND:',
    //   game.secondPlayerProgress?.answers,
    // );
    // //console.log();
    // //console.log();
    // console.log(
    //   '++FIRST:',
    //   game.firstPlayerProgress.score,
    //   '++SECOND:',
    //   game.secondPlayerProgress?.score,
    // );
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
    // sort first player`s answers by date: last answer will be first
    const answersOfFirstPlayer = game.firstPlayerProgress.answers.sort(
      (a, b) => Number(b.addedAt) - Number(a.addedAt),
    );
    // sort first player`s answers by date: last answer will be first
    const answersOfSecondPlayer = game.secondPlayerProgress!.answers.sort(
      (a, b) => Number(b.addedAt) - Number(a.addedAt),
    );

    //add one bonus point to first player(have one correct answer)
    if (answersOfFirstPlayer[0].addedAt < answersOfSecondPlayer[0].addedAt) {
      this.doesCorrectAnswerExist(answersOfFirstPlayer)
        ? (game.firstPlayerProgress.score += 1)
        : (game.firstPlayerProgress.score += 0);
      return;
    }

    //add one bonus point to second player(have one correct answer)
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
