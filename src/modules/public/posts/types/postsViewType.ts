import { postViewType } from './postViewType';

export type postsViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: postViewType[];
};
