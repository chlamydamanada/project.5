import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { sortingDirection } from '../../../../../helpers/validators/sortingDirection';
import { QuestionStatusType } from '../../types/questionStatusType';

export class QuestionsToSAQueryDto {
  @ApiPropertyOptional({
    type: String,
    default: null,
    description:
      'Search term for question body: Question should contains this term in any position',
  })
  @IsString()
  @IsOptional()
  bodySearchTerm: string | undefined;

  @ApiPropertyOptional({
    type: String,
    default: 'all',
  })
  @IsOptional()
  @IsEnum(QuestionStatusType)
  publishedStatus: QuestionStatusType;

  @ApiPropertyOptional({
    default: 1,
    type: Number,
    description: 'pageNumber is number of portions that should be returned',
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pageNumber = 1;

  @ApiPropertyOptional({
    default: 10,
    type: Number,
    description: 'pageSize is portions size that should be returned',
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pageSize = 10;

  @ApiPropertyOptional({ type: String, default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy = 'createdAt';

  @ApiPropertyOptional({
    type: String,
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => sortingDirection(value))
  sortDirection = 'desc';
}
