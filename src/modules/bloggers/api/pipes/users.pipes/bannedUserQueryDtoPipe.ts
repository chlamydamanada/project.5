import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { sortingDirection } from '../../../../../helpers/validators/sortingDirection';
import { sortingBy } from '../../../../../helpers/validators/sortingBy';

export class BannedUserQueryDtoPipe {
  @IsString()
  @IsOptional()
  searchLoginTerm: string | undefined;

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
  @Transform(({ value }) => sortingBy(value))
  sortBy = 'banDate';

  @IsOptional()
  @Transform(({ value }) => sortingDirection(value))
  sortDirection = 'desc';
}
