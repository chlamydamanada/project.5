import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuestionsToSARepository } from '../repositories/questionsToSA.repository';

export class UpdateQuestionCommand {
  constructor(
    public questionId: string,
    public body: string,
    public correctAnswers: string[],
  ) {}
}
@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(private readonly questionRepository: QuestionsToSARepository) {}
  async execute(command: UpdateQuestionCommand): Promise<void> {
    //check does question exist
    const question = await this.questionRepository.findQuestionById(
      command.questionId,
    );
    if (!question)
      throw new NotFoundException('The question with this id doesn`t exist');
    //check is question published
    if (question.published)
      throw new BadRequestException([
        {
          message: 'The question has already been published',
          field: 'published',
        },
      ]);
    //update question and save
    question.body = command.body;
    question.correctAnswers = command.correctAnswers;
    question.updatedAt = new Date();
    await this.questionRepository.saveQuestion(question);
    return;
  }
}
