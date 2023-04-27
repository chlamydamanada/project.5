import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { sortingDirection } from '../../../../../helpers/validators/sortingDirection';

export class QueryGamesDto {
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

  @ApiPropertyOptional({ type: String, default: 'pairCreatedDate' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => sortingByQueryQuizGame(value))
  sortBy = 'pairCreatedDate';

  @ApiPropertyOptional({
    type: String,
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sortingDirection(value))
  sortDirection = 'desc';
}

const sortingByQueryQuizGame = (value: string): string => {
  const availableValues = ['id', 'status', 'startGameDate', 'finishGameDate'];
  return value
    ? availableValues.includes(value)
      ? value
      : 'pairCreatedDate'
    : 'pairCreatedDate';
};
