import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';

@Injectable()
export class QuestionsToSARepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}
  async saveQuestion(question: Question): Promise<string> {
    const newQuestion = await this.questionsRepository.save(question);
    return newQuestion.id;
  }

  async doesQuestionExistByBody(questionBody: string): Promise<boolean> {
    const question = await this.questionsRepository.findOne({
      select: {
        id: true,
      },
      where: {
        body: questionBody,
      },
    });
    return !question ? false : true;
  }

  async doesQuestionExistById(questionId: string): Promise<boolean> {
    const question = await this.questionsRepository.findOneBy({
      id: questionId,
    });
    return !question ? false : true;
  }

  async deleteQuestionById(questionId: string): Promise<void> {
    await this.questionsRepository.delete({ id: questionId });
    return;
  }

  async findQuestionById(questionId: string): Promise<Question | null> {
    return this.questionsRepository.findOneBy({ id: questionId });
  }
}
