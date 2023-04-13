import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionPublishInputDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  published: boolean;
}
