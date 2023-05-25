import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Game } from '../../domain/game.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { GameViewModel } from '../../types/gameViewModel';
import { GameStatusModel } from '../../types/gameStatusType';
import { Answer } from '../../domain/answer.entity';
import { AnswerViewModel } from '../../types/answerViewModel';
import { GamesQueryType } from '../../types/gamesQueryType';
import { CurrentStatisticViewModel } from '../../types/currentStatisticViewModel';
import { StatisticDtoType } from '../../types/statisticDtoType';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addSeconds } from 'date-fns';
import { QueryGamesTopUsersDto } from '../pipes/queryGamesTopUsers.dto';
import { QuizStatisticQuery } from '../../types/statisticQueryEnum';
import { TopStatisticDtoType } from '../../types/topStatisticDtoType';
import { TopStatisticViewModel } from '../../types/topStatisticViewModel';

@Injectable()
export class QuizGamePublicQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly quizGameRepository: Repository<Game>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // @Cron(CronExpression.EVERY_SECOND)
  // private async cronTest() {
  //   const games = await this.quizGameRepository.find({
  //     relations: {
  //       firstPlayerProgress: {
  //         user: true,
  //         answers: true,
  //       },
  //       secondPlayerProgress: {
  //         user: true,
  //         answers: true,
  //       },
  //     },
  //     where: {
  //       status: GameStatusModel.active,
  //     },
  //   });
  //   const gamesToFinish = games.map((g: Game) => {
  //     if (
  //       g.firstPlayerProgress.answers.length === 5 &&
  //       g.firstPlayerProgress.answers[4].addedAt < addSeconds(new Date(), -10)
  //     ) {
  //       g.status = GameStatusModel.finished;
  //     }
  //     if (
  //       g.secondPlayerProgress!.answers.length === 5 &&
  //       g.secondPlayerProgress!.answers[4].addedAt < addSeconds(new Date(), -10)
  //     ) {
  //       g.status = GameStatusModel.finished;
  //     }
  //     return g;
  //   });
  //   await this.quizGameRepository.save(gamesToFinish);
  // }

  async findGameById(gameId: string): Promise<GameViewModel | null> {
    const game = await this.quizGameRepository.findOne({
      relations: {
        questions: {
          question: true,
        },
        firstPlayerProgress: {
          user: true,
          answers: true,
        },
        secondPlayerProgress: {
          user: true,
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
          user: {
            id: true,
            login: true,
          },
          answers: {
            id: true,
            questionId: true,
            addedAt: true,
            answerStatus: true,
          },
        },
        secondPlayerProgress: {
          score: true,
          user: {
            id: true,
            login: true,
          },
          answers: {
            id: true,
            questionId: true,
            addedAt: true,
            answerStatus: true,
          },
        },
      },
      where: { id: gameId },
      order: {
        firstPlayerProgress: {
          answers: {
            addedAt: 'ASC',
          },
        },
        secondPlayerProgress: {
          answers: {
            addedAt: 'ASC',
          },
        },

        questions: {
          addedAt: 'ASC',
        },
      },
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
          user: true,
          answers: true,
        },
        secondPlayerProgress: {
          user: true,
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
          user: {
            id: true,
            login: true,
          },
          answers: {
            id: true,
            questionId: true,
            addedAt: true,
            answerStatus: true,
          },
        },
        secondPlayerProgress: {
          score: true,
          user: {
            id: true,
            login: true,
          },
          answers: {
            id: true,
            questionId: true,
            addedAt: true,
            answerStatus: true,
          },
        },
      },
      where: [
        {
          firstPlayerProgress: { userId: userId },
          status: Not(GameStatusModel.finished),
        },
        {
          secondPlayerProgress: { userId: userId },
          status: Not(GameStatusModel.finished),
        },
      ],
      order: {
        firstPlayerProgress: {
          answers: {
            addedAt: 'ASC',
          },
        },
        secondPlayerProgress: {
          answers: {
            addedAt: 'ASC',
          },
        },
        questions: {
          addedAt: 'ASC',
        },
      },
    });
    if (!game) return null;
    return this.mapToViewGameModel(game);
  }

  async findAllGamesByUserId(userId: string, queryDto: GamesQueryType) {
    const [games, count] = await this.quizGameRepository.findAndCount({
      relations: {
        questions: {
          question: true,
        },
        firstPlayerProgress: {
          user: true,
          answers: true,
        },
        secondPlayerProgress: {
          user: true,
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
          id: true,
          score: true,
          user: {
            id: true,
            login: true,
          },
          answers: {
            id: true,
            questionId: true,
            addedAt: true,
            answerStatus: true,
          },
        },
        secondPlayerProgress: {
          id: true,
          score: true,
          user: {
            id: true,
            login: true,
          },
          answers: {
            id: true,
            questionId: true,
            addedAt: true,
            answerStatus: true,
          },
        },
      },
      where: [
        {
          firstPlayerProgress: { userId: userId },
        },
        {
          secondPlayerProgress: { userId: userId },
        },
      ],
      order: {
        [queryDto.sortBy]: queryDto.sortDirection,
        pairCreatedDate: 'DESC',
        // firstPlayerProgress: {
        //   answers: {
        //     addedAt: 'ASC',
        //   },
        // },
        // secondPlayerProgress: {
        //   answers: {
        //     addedAt: 'ASC',
        //   },
        // },
        // questions: {
        //   addedAt: 'ASC',
        // },
      },
      skip: (queryDto.pageNumber - 1) * queryDto.pageSize,
      take: queryDto.pageSize,
    });

    return {
      pagesCount: Math.ceil(count / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: count,
      items: games.map((g) => this.mapToViewGameModel(g)),
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

  private mapToViewGameModel(game: Game): GameViewModel {
    return {
      id: game.id,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
      firstPlayerProgress: {
        score: game.firstPlayerProgress.score,
        player: game.firstPlayerProgress.user,
        answers: game.firstPlayerProgress.answers
          .map((a) => ({
            questionId: a.questionId,
            answerStatus: a.answerStatus,
            addedAt: a.addedAt,
          }))
          .sort((a, b) => Number(a.addedAt) - Number(b.addedAt)), // sort like asc
      },
      secondPlayerProgress: !game.secondPlayerProgress
        ? null
        : {
            score: game.secondPlayerProgress.score,
            player: game.secondPlayerProgress.user,
            answers: game.secondPlayerProgress.answers
              .map((a) => ({
                questionId: a.questionId,
                answerStatus: a.answerStatus,
                addedAt: a.addedAt,
              }))
              .sort((a, b) => Number(a.addedAt) - Number(b.addedAt)), // sort like asc
          },
      questions:
        !game.questions || game.questions.length === 0
          ? null
          : game.questions
              .sort((a, b) => Number(a.addedAt) - Number(b.addedAt)) // sort like asc,
              .map((q) => ({
                id: q.question.id,
                body: q.question.body,
              })),
    };
  }

  async findUserGames(userId: string, queryDto: GamesQueryType) {
    const games = await this.dataSource.query(
      `
    SELECT g."id", g."status", g."pairCreatedDate", g."startGameDate", g."finishGameDate", array( 
        select row_to_json(row) from (
            select qq."questionId" as "id", qq."body" from (
                select * from "question_of_game" qg
                left join "question" q
                on q."id" = qg."questionId"
                order by qg."addedAt"  asc) qq
            where qq."gameId" = g."id")
        as row)
    as questions, --array of questions

(select row_to_json(row) as "firstPlayerProgress" from (
    select  pp."score", (
        select row_to_json(row) as "player" from (
            select u."id", u."login" from "user" u where u."id" = pp."userId") 
        as row), --json user info
        (select array(
            select row_to_json(row) from(
                select a."questionId", a."answerStatus", a."addedAt" 
                from "answer" a 
                where a."playerId" = pp."id"
                order by a."addedAt" asc)
            as row)
        as "answers") --array of users answers
    from public."player_progress" pp
    where pp."id" = g."firstPlayerProgressId")
 as row), --json first player progress
 
(select row_to_json(row) as "secondPlayerProgress" from (
    select  pp."score", (
        select row_to_json(row) as "player" from (
            select u."id", u."login" from "user" u where u."id" = pp."userId") 
        as row), --json user info
        (select array(
            select row_to_json(row) from(
                select a."questionId", a."answerStatus", a."addedAt" 
                from "answer" a 
                where a."playerId" = pp."id"
                order by a."addedAt" asc)
            as row)
        as "answers") --array of users answers
    from public."player_progress" pp
    where pp."id" = g."secondPlayerProgressId")
 as row) --json second player progress

from "game" g
left join "player_progress" fpp
on g."firstPlayerProgressId" = fpp."id"
left join "player_progress" spp
on g."secondPlayerProgressId" = spp."id"
where spp."userId" = $1 or fpp."userId" = $1
order by  "${queryDto.sortBy}" ${queryDto.sortDirection}, "pairCreatedDate" desc
limit $2 offset $3`,
      [
        userId,
        queryDto.pageSize,
        (queryDto.pageNumber - 1) * queryDto.pageSize,
      ],
    );
    const count = await this.dataSource.query(
      `
    select count(*) as "totalCount" from "game" g
    left join "player_progress" fpp
    on g."firstPlayerProgressId" = fpp."id"
    left join "player_progress" spp
    on g."secondPlayerProgressId" = spp."id"
    where spp."userId" = $1 or fpp."userId" = $1`,
      [userId],
    );

    return {
      pagesCount: Math.ceil(count[0].totalCount / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: +count[0].totalCount,
      items: games,
    };
  }

  async getUserStatistic(userId: string): Promise<CurrentStatisticViewModel> {
    const currentStatistic: StatisticDtoType[] = await this.dataSource.query(
      `
    select  (select sum(pp."score") as "sumScore" 
            from "player_progress" pp
            where pp."userId" = $1), -- sumScore of current user
             
            round((select sum(pp."score") 
            from "player_progress" pp
            where pp."userId" = $1)*1.0
            /
            (select count(*) from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where spp."userId" = $1 
            or fpp."userId" = $1)*1.0, 2) as "avgScores", -- avgScore of current user

            (select count(*) as "gamesCount" from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where spp."userId" = $1 
            or fpp."userId" = $1), --gamesScore of current user

            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where fpp."userId" = $1 
            and fpp."score" > spp."score") --winsCount like first player
            +
            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where spp."userId" = $1 
            and spp."score" > fpp."score") as "winsCount",  --winsCount like second player

            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where fpp."userId" = $1 
            and fpp."score" < spp."score") --lossesCount like first player
            +
            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where spp."userId" = $1    
            and spp."score" < fpp."score") as "lossesCount", --lossesCount like second player

            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where fpp."userId" = $1 
            and fpp."score" = spp."score") --drawsCount like first player
            +
            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where spp."userId" = $1 
            and spp."score" = fpp."score") as "drawsCount" --drawsCount like second player
`,
      [userId],
    );

    return new CurrentStatisticViewModel(currentStatistic[0]);
  }

  async getUsersTop(queryDto: QueryGamesTopUsersDto) {
    //make filter string by array of string
    const filter = this.createSortingFilter(queryDto.sort);
    //get all statistics of all players by filter
    const topOfUsers: TopStatisticDtoType[] = await this.dataSource.query(
      `
    select (select row_to_json(row) as "player" from 
                (select uu."id", uu."login"
                from "user" uu
                where uu."id" = u."id"
                ) 
            as row), -- player info

            (select sum(pp."score") as "sumScore" 
            from "player_progress" pp
            where pp."userId" = u."id"),-- sumScore of current user
            
            round((select sum(pp."score") 
            from "player_progress" pp
            where pp."userId" = u."id")*1.0
            /
            (select count(*) from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where spp."userId" = u."id" 
            or fpp."userId" = u."id")*1.0, 2) as "avgScores", -- avgScore of current user

            (select count(*) as "gamesCount" from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where spp."userId" = u."id" 
            or fpp."userId" = u."id"), --gamesCount of current user

            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where fpp."userId" = u."id" 
            and fpp."score" > spp."score") --winsCount like first player
            +
            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where spp."userId" = u."id" 
            and spp."score" > fpp."score") as "winsCount",  --winsCount like second player

            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where fpp."userId" = u."id" 
            and fpp."score" < spp."score") --lossesCount like first player
            +
            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where spp."userId" = u."id" 
            and spp."score" < fpp."score") as "lossesCount", --lossesCount like second player

            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where fpp."userId" = u."id" 
            and fpp."score" = spp."score") --drawsCount like first player
            +
            (select count(*)  from "game" g
            left join "player_progress" fpp
            on g."firstPlayerProgressId" = fpp."id"
            left join "player_progress" spp
            on g."secondPlayerProgressId" = spp."id"
            where spp."userId" = u."id" 
            and spp."score" = fpp."score") as "drawsCount" --drawsCount like second player
from "user" u
where (select count(*) from "game" g
        left join "player_progress" fpp
        on g."firstPlayerProgressId" = fpp."id"
        left join "player_progress" spp
        on g."secondPlayerProgressId" = spp."id"
        where spp."userId" = u."id" 
        or fpp."userId" = u."id") > 0
        order by ${filter}
        limit $1 offset $2`,
      [queryDto.pageSize, (queryDto.pageNumber - 1) * queryDto.pageSize],
    );

    //count of all statistics of all players
    const count = await this.dataSource.query(`
select count(*) as "totalCount" 
from "user" u 
where (select count(*) from "game" g
        left join "player_progress" fpp
        on g."firstPlayerProgressId" = fpp."id"
        left join "player_progress" spp
        on g."secondPlayerProgressId" = spp."id"
        where spp."userId" = u."id" 
        or fpp."userId" = u."id") > 0`);

    return {
      pagesCount: Math.ceil(count[0].totalCount / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: +count[0].totalCount,
      items: topOfUsers.map((e) => new TopStatisticViewModel(e)),
    };
  }
  private createSortingFilter(values: QuizStatisticQuery[]): string {
    const result = values.reduce((accumulator, currentValue) => {
      const field = currentValue.split(' ')[0];
      const sortBy = currentValue.split(' ')[1];

      //add first string without ',' in start
      if (!accumulator) {
        return `"${field}" ${sortBy}`;
      }
      //all other string should be separated by ', '
      return `${accumulator}, "${field}" ${sortBy}`;
    }, '');

    return result;
  }
}
