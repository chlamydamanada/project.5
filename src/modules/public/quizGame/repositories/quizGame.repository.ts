import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    @InjectDataSource() private dataSource: DataSource,
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
          firstPlayerProgress: { userId: userId },
        },
        {
          status: GameStatusModel.active,
          secondPlayerProgress: { userId: userId },
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

  async getGamesToBeFinished(): Promise<Game[]> {
    const games = await this.dataSource.query(`
select g.*, 
       array(select row_to_json(row) 
            from (select qg."id", qg."questionId"
                  from "question_of_game" qg
                  where qg."gameId" = g."id")
            as row)
       as questions, --array of questions id

       (select row_to_json(row) as "firstPlayerProgress" 
        from (select  pp.*, 
                      array(select row_to_json(row) 
                            from(select a."id", a."answerStatus"
                                 from "answer" a 
                                 where a."playerId" = pp."id")
                            as row)
                      as "answers" --array of users answers
               from "player_progress" pp
               where pp."id" = g."firstPlayerProgressId")
        as row), --json first player progress
 
        (select row_to_json(row) as "secondPlayerProgress" 
        from (select  pp.*, 
                      array(select row_to_json(row) 
                            from (select a."id", a."answerStatus"
                                  from "answer" a 
                                  where a."playerId" = pp."id")
                            as row)
                      as "answers" --array of users answers
               from public."player_progress" pp
               where pp."id" = g."secondPlayerProgressId")
        as row) --json second player progress 
from "game" g
where 
    (
        (
        (select count (*) from "question_of_game" qg
        where qg."gameId" = g."id") -- count of questions
        =
        (select count (*) from (
            select * from "player_progress" pp
            left join "answer" a
            on a."playerId" = pp."id"
            where pp."id" = g."firstPlayerProgressId") as "answers") --count of all answers of first player
        and
        (select count (*) from "question_of_game" qg
        where qg."gameId" = g."id") -- count of questions
        >
        (select count (*) from (
            select * from "player_progress" pp
            left join "answer" a
            on a."playerId" = pp."id"
            where pp."id" = g."secondPlayerProgressId") as "answers") --count of all answers of second player
        and
        
        (select a."addedAt" + interval '10 second' as "after"
        from "answer" a
        where (
            select max(aa."addedAt") from "answer" aa
            where aa."playerId" = a."playerId" -- last date of answer
            ) = a."addedAt" 
            and a."playerId" = g."firstPlayerProgressId") 
        <
        (select  current_timestamp as "dateNow")
    ) 
    or
    (
        (select count (*) from "question_of_game" qg
        where qg."gameId" = g."id") -- count of questions
        =
        (select count (*) from (
            select * from "player_progress" pp
            left join "answer" a
            on a."playerId" = pp."id"
            where pp."id" = g."secondPlayerProgressId") as "answers") --count of all answers of second player
        and
        (select count (*) from "question_of_game" qg
        where qg."gameId" = g."id") -- count of questions
        >
        (select count (*) from (
            select * from "player_progress" pp
            left join "answer" a
            on a."playerId" = pp."id"
            where pp."id" = g."firstPlayerProgressId") as "answers") --count of all answers of first player
        and
        (select a."addedAt" + interval '9 second' as "after"
        from "answer" a
        where (
            select max(aa."addedAt") from "answer" aa
            where aa."playerId" = a."playerId") = a."addedAt" 
            and a."playerId" = g."secondPlayerProgressId")
        <=
        (select  current_timestamp as "dateNow")
        )
    ) 
    and g."status" = 'Active'
    `);
    console.log('REPO:', games);
    return games;
  }
}
