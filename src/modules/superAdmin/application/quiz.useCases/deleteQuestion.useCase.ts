import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsToSARepository } from '../../repositories/questionsToSA.repository';
import { NotFoundException } from '@nestjs/common';

export class DeleteQuestionCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(private readonly questionRepository: QuestionsToSARepository) {}
  async execute(command: DeleteQuestionCommand): Promise<void> {
    //check does exist question by id
    const doesExist = await this.questionRepository.doesQuestionExistById(
      command.questionId,
    );
    if (!doesExist)
      throw new NotFoundException('Question with this id doesn`t exist');

    //delete question by id
    await this.questionRepository.deleteQuestionById(command.questionId);
    return;
  }
}
