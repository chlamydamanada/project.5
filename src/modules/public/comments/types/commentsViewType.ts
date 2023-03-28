import { CommentViewType } from './commentViewType';

export type CommentsViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentViewType[];
};
