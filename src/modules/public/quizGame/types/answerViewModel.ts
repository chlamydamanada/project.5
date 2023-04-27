import { AnswerStatusType } from './answerStatusType';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerViewModel {
  @ApiProperty()
  questionId: string;

  @ApiProperty({ type: String, enum: ['Correct', 'Incorrect'] })
  answerStatus: AnswerStatusType;

  @ApiProperty()
  addedAt: Date;
}
