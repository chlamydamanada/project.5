import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsToSARepository } from '../../repositories/questionsToSA.repository';
import { NotFoundException } from '@nestjs/common';

export class PublishOrUnpublishQuestionCommand {
  constructor(public questionId: string, public published: boolean) {}
}

@CommandHandler(PublishOrUnpublishQuestionCommand)
export class PublishOrUnpublishQuestionUseCase
  implements ICommandHandler<PublishOrUnpublishQuestionCommand>
{
  constructor(private readonly questionRepository: QuestionsToSARepository) {}
  async execute(command: PublishOrUnpublishQuestionCommand): Promise<void> {
    //check does question exist
    const question = await this.questionRepository.findQuestionById(
      command.questionId,
    );
    if (!question)
      throw new NotFoundException('The question with this id doesn`t exist');
    // change field published and save
    question.published = command.published;
    question.updatedAt = new Date();
    await this.questionRepository.saveQuestion(question);
    return;
  }
}
