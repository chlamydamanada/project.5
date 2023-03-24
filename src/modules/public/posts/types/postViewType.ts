import { extendedLikesInfoType } from '../../likeStatus/types/extendedLikesInfoOfPostType';

export type postViewType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: extendedLikesInfoType;
};
