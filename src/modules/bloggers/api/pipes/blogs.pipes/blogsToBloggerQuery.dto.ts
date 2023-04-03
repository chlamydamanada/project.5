import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { sortingDirection } from '../../../../../helpers/validators/sortingDirection';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BlogsToBloggerQueryDto {
  @ApiPropertyOptional({
    type: String,
    default: null,
    description:
      'Search term for blog Name: Name should contains this term in any position',
  })
  @IsString()
  @IsOptional()
  searchNameTerm: string;

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
    description: 'Available values : asc, desc',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sortingDirection(value))
  sortDirection = 'desc';
}
