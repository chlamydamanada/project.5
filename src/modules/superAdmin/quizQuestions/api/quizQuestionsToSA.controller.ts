import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../public/auth/guards/auth-guard';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionsToSAQueryRepository } from './query.repositories/questionsToSAQuery.repository';
import { QuestionViewModel } from '../types/questionViewModel';
import { QuestionQueryType } from '../types/questionQueryType';
import { QuestionsToSAQueryDto } from './pipes/questionsToSAQuery.dto';
import { QuestionsViewModel } from '../types/questionsViewModel';
import { PublishOrUnpublishQuestionCommand } from '../useCases/publishOrUnpublishQuestion.useCase';
import { UpdateQuestionCommand } from '../useCases/updateQuestion.useCase';
import { CreateQuestionCommand } from '../useCases/createQuestion.useCase';
import { QuestionCreateInputDto } from './pipes/questionCreateInput.dto';
import { QuestionPublishInputDto } from './pipes/questionPublishInput.dto';
import { DeleteQuestionCommand } from '../useCases/deleteQuestion.useCase';
import { QuestionUpdateInputDto } from './pipes/questionUpdateInput.dto';
import { GetQuestionsBySASwaggerDecorator } from '../../../../swagger/decorators/sa/quizQuestions/getQuestionsBySA.swagger.decorator';
import { CreateQuestionBySASwaggerDecorator } from '../../../../swagger/decorators/sa/quizQuestions/createQuestionBySA.swagger.decorator';
import { UpdateQuestionBySASwaggerDecorator } from '../../../../swagger/decorators/sa/quizQuestions/updateQuestionBySA.swagger.decorator';
import { PublishQuestionBySASwaggerDecorator } from '../../../../swagger/decorators/sa/quizQuestions/publishQuestionBySA.swagger.decorator';
import { DeleteQuestionBySASwaggerDecorator } from '../../../../swagger/decorators/sa/quizQuestions/deleteQuestionBySA.swagger.decorator';

@ApiTags('Quiz Questions')
@ApiBasicAuth()
@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class QuizQuestionsToSAController {
  constructor(
    private readonly questionsQueryRepository: QuestionsToSAQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @GetQuestionsBySASwaggerDecorator()
  async getAllQuestions(
    @Query() query: QuestionsToSAQueryDto,
  ): Promise<QuestionsViewModel> {
    const questions = await this.questionsQueryRepository.findAllQuestions(
      query as QuestionQueryType,
    );
    return questions;
  }

  @Post()
  @CreateQuestionBySASwaggerDecorator()
  async createQuestion(
    @Body() questionCreateInputModel: QuestionCreateInputDto,
  ): Promise<QuestionViewModel> {
    //create question
    const questionId = await this.commandBus.execute<
      CreateQuestionCommand,
      string
    >(
      new CreateQuestionCommand(
        questionCreateInputModel.body,
        questionCreateInputModel.correctAnswers,
      ),
    );
    //return in view form
    const question = await this.questionsQueryRepository.findQuestionById(
      questionId,
    );
    return question!;
  }

  @Put(':questionId')
  @UpdateQuestionBySASwaggerDecorator()
  @HttpCode(204)
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() questionUpdateInputDto: QuestionUpdateInputDto,
  ): Promise<void> {
    await this.commandBus.execute<UpdateQuestionCommand>(
      new UpdateQuestionCommand(
        questionId,
        questionUpdateInputDto.body,
        questionUpdateInputDto.correctAnswers,
      ),
    );
    return;
  }

  @Put(':questionId/publish')
  @PublishQuestionBySASwaggerDecorator()
  @HttpCode(204)
  async publishOrUnpublishQuestion(
    @Param('questionId') questionId: string,
    @Body() questionPublishInputDto: QuestionPublishInputDto,
  ): Promise<void> {
    await this.commandBus.execute<PublishOrUnpublishQuestionCommand>(
      new PublishOrUnpublishQuestionCommand(
        questionId,
        questionPublishInputDto.published,
      ),
    );
    return;
  }

  @Delete(':questionId')
  @DeleteQuestionBySASwaggerDecorator()
  @HttpCode(204)
  async deleteQuestion(@Param('questionId') questionId: string): Promise<void> {
    await this.commandBus.execute<DeleteQuestionCommand>(
      new DeleteQuestionCommand(questionId),
    );
    return;
  }
}
