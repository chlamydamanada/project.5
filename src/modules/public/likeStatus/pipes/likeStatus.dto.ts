import { IsEnum, IsNotEmpty } from 'class-validator';
import { reactionStatusType } from '../types/statusType';
import { ApiProperty } from '@nestjs/swagger';

export class LikeStatusDto {
  @ApiProperty({
    type: String,
    description: 'Send None if you want to unlike/undislike',
    enum: ['None', 'Like', 'Dislike'],
  })
  @IsNotEmpty()
  @IsEnum(reactionStatusType)
  likeStatus: reactionStatusType;
}
