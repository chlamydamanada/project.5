import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { sortingDirection } from '../../../../../helpers/validators/sortingDirection';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BanStatusType } from '../../types/banStatusType';

export class UsersToSAQueryDto {
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
    type: String,
    default: null,
    description:
      'Search term for user Email: Email should contains this term in any position',
  })
  @IsString()
  @IsOptional()
  searchEmailTerm: string | undefined;

  @ApiPropertyOptional({
    type: String,
    default: 'all',
  })
  @IsOptional()
  @IsEnum(BanStatusType)
  banStatus: BanStatusType;

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
