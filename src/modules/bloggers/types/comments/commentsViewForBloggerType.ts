import { CommentViewForBloggerType } from './commentViewForBloggerType';

export type CommentsViewForBloggerType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentViewForBloggerType[];
};
