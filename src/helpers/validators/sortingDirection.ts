export const sortingDirection = (value: string): 'asc' | 'desc' => {
  return value ? (value === 'asc' ? 'asc' : 'desc') : 'desc';
};
