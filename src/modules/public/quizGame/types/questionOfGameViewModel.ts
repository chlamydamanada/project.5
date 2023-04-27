import { ApiProperty } from '@nestjs/swagger';

export class QuestionOfGameViewModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  body: string;
}
