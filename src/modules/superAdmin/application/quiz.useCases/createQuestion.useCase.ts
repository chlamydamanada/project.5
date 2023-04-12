import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Question } from '../../domain/quizQuestions.entities/question.entity';
import { QuestionsToSARepository } from '../../repositories/questionsToSA.repository';
import { BadRequestException } from '@nestjs/common';

export class CreateQuestionCommand {
  constructor(public body: string, public correctAnswers: string[]) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(private readonly questionRepository: QuestionsToSARepository) {}

  async execute(command: CreateQuestionCommand): Promise<string> {
    //check does exist question by body
    const doesExist = await this.questionRepository.doesQuestionExistByBody(
      command.body,
    );
    if (doesExist)
      throw new BadRequestException([
        { message: 'This question already exists', field: 'body' },
      ]);

    //create new question
    const question = new Question();
    question.body = command.body;
    question.correctAnswers = command.correctAnswers;

    //save question and return question id
    const questionId = await this.questionRepository.saveQuestion(question);
    return questionId;
  }
}
