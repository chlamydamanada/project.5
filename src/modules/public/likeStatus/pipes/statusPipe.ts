import { IsEnum, IsNotEmpty } from 'class-validator';
import { reactionStatusType } from '../types/statusType';

export class StatusPipe {
  @IsNotEmpty()
  @IsEnum(reactionStatusType)
  likeStatus: reactionStatusType;
}
