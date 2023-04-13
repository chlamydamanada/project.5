import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { sortingDirection } from '../../../../../helpers/validators/sortingDirection';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CommentToBloggerQueryDto {
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

  @ApiPropertyOptional({ type: String, default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy = 'createdAt';

  @ApiPropertyOptional({
    type: String,
    default: 'desc',
    enum: ['desc', 'asc'],
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sortingDirection(value))
  sortDirection = 'desc';
}
