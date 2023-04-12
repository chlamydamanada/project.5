import { QuestionStatusType } from './questionStatusType';
import { SortDirection } from '../users/userQueryType';

export type QuestionQueryType = {
  bodySearchTerm: string | undefined;
  publishedStatus: QuestionStatusType;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
};
