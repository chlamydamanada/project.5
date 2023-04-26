import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../domain/game.entity';
import { GameStatusModel } from '../types/gameStatusType';
import { PlayerProgress } from '../domain/player.entity';
import { Question } from '../../../superAdmin/quizQuestions/domain/question.entity';
import { QuestionOfGame } from '../domain/questionOfGame.entity';
import { Answer } from '../domain/answer.entity';

@Injectable()
export class QuizGamePublicRepository {
  constructor(
    @InjectRepository(Game)
    private readonly quizGameRepository: Repository<Game>,
    @InjectRepository(PlayerProgress)
    private readonly playersRepository: Repository<PlayerProgress>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(QuestionOfGame)
    private readonly questionsOfGameRepository: Repository<QuestionOfGame>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  async savePlayer(playerDto: PlayerProgress): Promise<string> {
    const player = await this.playersRepository.save(playerDto);
    return player.id;
  }

  async saveGame(gameDto: Game): Promise<void> {
    await this.quizGameRepository.save(gameDto);
    return;
  }

  async saveQuestionOfGame(question: QuestionOfGame): Promise<QuestionOfGame> {
    return await this.questionsOfGameRepository.save(question);
  }

  async saveAnswer(answer: Answer): Promise<void> {
    await this.answerRepository.save(answer);
    return;
  }

  async findPendingGame() {
    return await this.quizGameRepository.findOne({
      relations: {
        firstPlayerProgress: true,
      },
      where: {
        status: GameStatusModel.pending,
      },
    });
  }

  async findActiveGameByUserId(userId: string): Promise<Game | null> {
    return await this.quizGameRepository.findOne({
      relations: {
        questions: {
          question: true,
        },
        firstPlayerProgress: {
          answers: true,
        },
        secondPlayerProgress: {
          answers: true,
        },
      },
      where: [
        {
          status: GameStatusModel.active,
          firstPlayerProgress: { playerId: userId },
        },
        {
          status: GameStatusModel.active,
          secondPlayerProgress: { playerId: userId },
        },
      ],
      order: {
        questions: {
          addedAt: 'ASC',
        },
      },
    });
  }

  async getSeveralRandomQuestions(
    count: number,
  ): Promise<{ id: string; body: string }[]> {
    return this.questionsRepository
      .createQueryBuilder('q')
      .select('q.id, q.body')
      .where('q.published = true')
      .orderBy('RANDOM ()')
      .take(count)
      .getRawMany();
  }
}
