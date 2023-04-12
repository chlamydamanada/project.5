import { QuestionViewModel } from './questionViewModel';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionsViewModel {
  @ApiProperty()
  pagesCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ isArray: true, type: QuestionViewModel })
  items: QuestionViewModel[];
}
