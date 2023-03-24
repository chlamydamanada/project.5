export type BannedUsersForBlogType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BannedUserForBlogType[];
};

export type BannedUserForBlogType = {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
};
