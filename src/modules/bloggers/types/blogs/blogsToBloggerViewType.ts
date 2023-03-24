import { BlogToBloggerViewType } from './blogToBloggerViewType';

export type BlogsToBloggerViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogToBloggerViewType[];
};
