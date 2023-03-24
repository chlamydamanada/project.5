import { blogViewType } from './blogViewType';

export type blogsViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: blogViewType[];
};
