export type BannedUserQueryDtoType = {
  searchLoginTerm: string | undefined;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
};
