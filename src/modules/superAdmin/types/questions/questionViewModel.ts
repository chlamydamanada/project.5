import { ApiProperty } from '@nestjs/swagger';

export class QuestionViewModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ isArray: true, type: String })
  correctAnswers: string[];

  @ApiProperty({ default: false })
  published: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date | null;
}
