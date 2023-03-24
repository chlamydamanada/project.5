import { BlogSAType } from './blogSAType';

export type BlogsSAType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogSAType[];
};
