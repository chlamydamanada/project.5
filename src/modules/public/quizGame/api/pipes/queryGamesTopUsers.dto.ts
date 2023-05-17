import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { QuizStatisticQuery } from '../../types/statisticQueryEnum';

export class QueryGamesTopUsersDto {
  @ApiPropertyOptional({
    default: 1,
    type: Number,
    description: 'pageNumber is number of portions that should be returned',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageNumber = 1;

  @ApiPropertyOptional({
    default: 10,
    type: Number,
    description: 'pageSize is portions size that should be returned',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize = 10;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => sortFields(value))
  @IsEnum(QuizStatisticQuery, { each: true })
  sort: QuizStatisticQuery[] = [
    QuizStatisticQuery.avgScoresDesc,
    QuizStatisticQuery.sumScoreDesc,
  ];
}

const sortFields = (value: string[] | string): string[] => {
  return Array.isArray(value) ? value : [value];
};
