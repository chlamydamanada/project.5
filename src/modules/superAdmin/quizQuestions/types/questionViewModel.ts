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

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ nullable: true, type: Date })
  updatedAt: Date | null;
}
