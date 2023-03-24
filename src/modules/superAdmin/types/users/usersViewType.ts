import { UserViewType } from './userViewType';

export type UsersViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UserViewType[];
};
