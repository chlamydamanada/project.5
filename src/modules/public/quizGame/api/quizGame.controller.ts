import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards/accessTokenAuth.guard';
import { CurrentUserId } from '../../../../helpers/decorators/currentUserId.decorator';
import { ConnectionToGameCommand } from '../useCases/connectionToGame.useCase';
import { QuizGamePublicQueryRepository } from './query.repositories/quizGameQuery.repository';
import { GameViewModel } from '../types/gameViewModel';
import { AnswerCreateInputDto } from './pipes/answerCreateInput.dto';
import { CreateAnswerOfCurrentUserCommand } from '../useCases/createAnswerOfCurrentUser.useCase';
import { AnswerViewModel } from '../types/answerViewModel';
import { ConnectionToGameSwaggerDecorator } from '../../../../swagger/decorators/public/quizGame/connectionToGame.swagger.decorator';
import { GetCurrentGameSwaggerDecorator } from '../../../../swagger/decorators/public/quizGame/getCurrentGame.swagger.decorator';
import { CreateAnswerOfCurrentUserSwaggerDecorator } from '../../../../swagger/decorators/public/quizGame/createAnswerOfCurrentUser.swagger.decorator';
import { GetGameByIdSwaggerDecorator } from '../../../../swagger/decorators/public/quizGame/getGameById.swagger.decorator';
import { QueryGamesDto } from './pipes/queryGames.dto';
import { GamesQueryType } from '../types/gamesQueryType';
import { GamesViewModel } from '../types/gamesViewModel';
import { CurrentStatisticViewModel } from '../types/currentStatisticViewModel';
import { QueryGamesTopUsersDto } from './pipes/queryGamesTopUsers.dto';
import {
  FinishGamesInFewSecondsCommand,
  FinishGamesInFewSecondsUseCase,
} from '../useCases/finishGamesInFewSeconds.useCase';
import { Cron, CronExpression } from '@nestjs/schedule';

@ApiTags('PairGameQuiz')
@Controller('pair-game-quiz')
export class QuizGamePublicController {
  constructor(
    private readonly quizGameQueryRepository: QuizGamePublicQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @Cron(CronExpression.EVERY_SECOND)
  async finishGamesInFewSeconds() {
    await this.commandBus.execute(new FinishGamesInFewSecondsCommand());
  }

  @Get('users/top')
  async getTopUsers(@Query() queryDto: QueryGamesTopUsersDto) {
    const topUsers = await this.quizGameQueryRepository.getUsersTop(queryDto);
    return topUsers;
  }

  @Get('users/my-statistic')
  @UseGuards(AccessTokenGuard)
  async getCurrentStatistic(
    @CurrentUserId() userId: string,
  ): Promise<CurrentStatisticViewModel> {
    const currentStatistic =
      await this.quizGameQueryRepository.getUserStatistic(userId);
    return currentStatistic;
  }

  @Post('pairs/connection')
  @UseGuards(AccessTokenGuard)
  @ConnectionToGameSwaggerDecorator()
  @HttpCode(200)
  async connectionToGame(
    @CurrentUserId() userId: string,
  ): Promise<GameViewModel> {
    const gameId = await this.commandBus.execute<
      ConnectionToGameCommand,
      string
    >(new ConnectionToGameCommand(userId));
    const game = await this.quizGameQueryRepository.findGameById(gameId);
    return game!;
  }

  @Get('pairs/my-current')
  @UseGuards(AccessTokenGuard)
  @GetCurrentGameSwaggerDecorator()
  async getCurrentGameByUserId(
    @CurrentUserId() userId: string,
  ): Promise<GameViewModel> {
    const game = await this.quizGameQueryRepository.findGameByUserId(userId);

    //check does game exist
    if (!game) throw new NotFoundException('You haven`t the active game');

    return game;
  }

  @Get('pairs/my')
  @UseGuards(AccessTokenGuard)
  async getAllGamesByUserId(
    @Query() queryDto: QueryGamesDto,
    @CurrentUserId() userId: string,
  ): Promise<GamesViewModel> {
    const games = await this.quizGameQueryRepository.findUserGames(
      userId,
      queryDto as GamesQueryType,
    );
    return games;
  }

  @Post('pairs/my-current/answers')
  @UseGuards(AccessTokenGuard)
  @CreateAnswerOfCurrentUserSwaggerDecorator()
  @HttpCode(200)
  async createAnswerOfCurrentUser(
    @CurrentUserId() userId: string,
    @Body() answerDto: AnswerCreateInputDto,
  ): Promise<AnswerViewModel> {
    //create answer and return id
    const answerId = await this.commandBus.execute<
      CreateAnswerOfCurrentUserCommand,
      string
    >(new CreateAnswerOfCurrentUserCommand(userId, answerDto.answer));

    // find answer by id
    const answer = await this.quizGameQueryRepository.findAnswerById(answerId);
    return answer!;
  }

  @Get('pairs/:id')
  @UseGuards(AccessTokenGuard)
  @GetGameByIdSwaggerDecorator()
  async getGameById(
    @CurrentUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) gameId: string,
  ): Promise<GameViewModel> {
    const game = await this.quizGameQueryRepository.findGameById(gameId);

    //check does game exist
    if (!game) throw new NotFoundException('The game with this id not found');

    //check is user one of players of the game
    if (
      userId !== game.firstPlayerProgress.player.id &&
      userId !== game.secondPlayerProgress?.player.id
    )
      throw new ForbiddenException('You haven`t part in the game with this id');

    return game;
  }
}
