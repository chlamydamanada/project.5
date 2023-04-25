import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../../domain/game.entity';
import { Not, Repository } from 'typeorm';
import { GameViewModel } from '../../types/gameViewModel';
import { GameStatusModel } from '../../types/gameStatusType';
import { Answer } from '../../domain/answer.entity';
import { AnswerViewModel } from '../../types/answerViewModel';

@Injectable()
export class QuizGamePublicQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly quizGameRepository: Repository<Game>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  async findGameById(gameId: string): Promise<GameViewModel | null> {
    const game = await this.quizGameRepository.findOne({
      relations: {
        questions: {
          question: true,
        },
        firstPlayerProgress: {
          player: true,
          answers: true,
        },
        secondPlayerProgress: {
          player: true,
          answers: true,
        },
      },
      select: {
        id: true,
        status: true,
        pairCreatedDate: true,
        startGameDate: true,
        finishGameDate: true,
        questions: true,
        firstPlayerProgress: {
          score: true,
          player: {
            id: true,
            login: true,
          },
          answers: {
            questionId: true,
            addedAt: true,
            answerStatus: true,
          },
        },
        secondPlayerProgress: {
          score: true,
          player: {
            id: true,
            login: true,
          },
          answers: {
            questionId: true,
            addedAt: true,
            answerStatus: true,
          },
        },
      },
      where: { id: gameId },
    });
    if (!game) return null;
    return this.mapToViewGameModel(game);
  }

  async findGameByUserId(userId: string): Promise<GameViewModel | null> {
    const game = await this.quizGameRepository.findOne({
      relations: {
        questions: {
          question: true,
        },
        firstPlayerProgress: {
          player: true,
          answers: true,
        },
        secondPlayerProgress: {
          player: true,
          answers: true,
        },
      },
      select: {
        id: true,
        status: true,
        pairCreatedDate: true,
        startGameDate: true,
        finishGameDate: true,
        questions: true,
        firstPlayerProgress: {
          score: true,
          player: {
            id: true,
            login: true,
          },
          answers: {
            questionId: true,
            addedAt: true,
            answerStatus: true,
          },
        },
        secondPlayerProgress: {
          score: true,
          player: {
            id: true,
            login: true,
          },
          answers: {
            questionId: true,
            addedAt: true,
            answerStatus: true,
          },
        },
      },
      where: [
        {
          firstPlayerProgress: { playerId: userId },
          status: Not(GameStatusModel.finished),
        },
        {
          secondPlayerProgress: { playerId: userId },
          status: Not(GameStatusModel.finished),
        },
      ],
    });
    if (!game) return null;
    return this.mapToViewGameModel(game);
  }

  private mapToViewGameModel(game: Game): GameViewModel {
    return {
      id: game.id,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
      firstPlayerProgress: {
        score: game.firstPlayerProgress.score,
        player: game.firstPlayerProgress.player,
        answers:
          game.firstPlayerProgress.answers?.length === 0
            ? null
            : game.firstPlayerProgress.answers,
      },
      secondPlayerProgress: !game.secondPlayerProgress
        ? null
        : {
            score: game.secondPlayerProgress.score,
            player: game.secondPlayerProgress.player,
            answers:
              game.secondPlayerProgress.answers?.length === 0
                ? null
                : game.secondPlayerProgress.answers,
          },
      questions:
        !game.questions || game.questions.length === 0
          ? null
          : game.questions.map((q) => ({
              id: q.question.id,
              body: q.question.body,
            })),
    };
  }

  async findAnswerById(answerId: string): Promise<AnswerViewModel | null> {
    return this.answerRepository.findOne({
      select: {
        questionId: true,
        answerStatus: true,
        addedAt: true,
      },
      where: {
        id: answerId,
      },
    });
  }
}
