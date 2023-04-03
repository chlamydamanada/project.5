import { IsNumber, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { sortingDirection } from '../../../../../helpers/validators/sortingDirection';

export class CommentQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageNumber = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize = 10;

  @IsOptional()
  sortBy = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => sortingDirection(value))
  sortDirection = 'desc';
}