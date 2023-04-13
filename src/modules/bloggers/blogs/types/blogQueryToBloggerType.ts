export type BlogQueryToBloggerType = {
  searchNameTerm: string | null;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
};
