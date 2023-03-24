import { newestLikesForPostType } from './newestLikesForPostType';
import { reactionStatusType } from './statusType';

export type extendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: newestLikesForPostType[];
};
