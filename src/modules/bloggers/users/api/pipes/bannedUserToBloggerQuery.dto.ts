import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { sortingDirection } from '../../../../../helpers/validators/sortingDirection';
import { sortingBy } from '../../../../../helpers/validators/sortingBy';

export class BannedUserToBloggerQueryDto {
  @ApiPropertyOptional({
    type: String,
    default: null,
    description:
      'Search term for user Login: Login should contains this term in any position',
  })
  @IsString()
  @IsOptional()
  searchLoginTerm: string | undefined;

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

  @ApiPropertyOptional({ type: String, default: 'banDate' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => sortingBy(value))
  sortBy = 'banDate';

  @ApiPropertyOptional({
    type: String,
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sortingDirection(value))
  sortDirection = 'desc';
}
