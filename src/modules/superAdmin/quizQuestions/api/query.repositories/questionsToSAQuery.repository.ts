import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionViewModel } from '../../types/questionViewModel';
import { QuestionQueryType } from '../../types/questionQueryType';
import { QuestionsViewModel } from '../../types/questionsViewModel';
import { QuestionStatusType } from '../../types/questionStatusType';
import { Question } from '../../domain/question.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class QuestionsToSAQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}
  async findQuestionById(
    questionId: string,
  ): Promise<QuestionViewModel | null> {
    return await this.questionsRepository.findOne({
      where: {
        id: questionId,
      },
    });
  }

  async findAllQuestions(
    queryDto: QuestionQueryType,
  ): Promise<QuestionsViewModel> {
    //create filter
    const filter = this.createFilterForBodyAndStatusOfQuestion(
      queryDto.bodySearchTerm,
      queryDto.publishedStatus,
    );
    //find questions
    const questions = await this.questionsRepository.find({
      select: {
        id: true,
        body: true,
        correctAnswers: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
      where: filter,
      order: { [queryDto.sortBy]: queryDto.sortDirection },
      skip: (queryDto.pageNumber - 1) * queryDto.pageSize,
      take: queryDto.pageSize,
    });
    //count of questions
    const totalCount = await this.questionsRepository.count({
      where: filter,
    });
    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: totalCount,
      items: questions,
    };
  }
  createFilterForBodyAndStatusOfQuestion(
    body: string | undefined,
    publishStatus: QuestionStatusType,
  ) {
    const status = this.createPublishStatusFilter(publishStatus);
    if (body) {
      return {
        ...status,
        body: ILike(`%${body}%`),
      };
    }
    return status;
  }

  createPublishStatusFilter(publishStatus: QuestionStatusType) {
    switch (publishStatus) {
      case QuestionStatusType.notPublished:
        return { published: false };
      case QuestionStatusType.published:
        return { published: true };
      default:
        return {};
    }
  }
}
