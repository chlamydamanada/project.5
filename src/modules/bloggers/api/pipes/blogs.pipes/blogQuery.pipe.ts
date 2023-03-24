import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { sortingDirection } from '../../../../../helpers/validators/sortingDirection';

export class BlogQueryPipe {
  @IsString()
  @IsOptional()
  searchNameTerm: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pageNumber = 1;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pageSize = 10;

  @IsString()
  @IsOptional()
  sortBy = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => sortingDirection(value))
  sortDirection = 'desc';
}
