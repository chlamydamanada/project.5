export const sortingBy = (value: string | undefined): string => {
  if (value === 'id') return 'userId';
  if (value === 'login') return 'userLogin';
  if (value === 'banReason') return value;
  return 'banDate';
};
