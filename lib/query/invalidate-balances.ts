import { queryClient } from './client';

export function invalidateBalances() {
  queryClient.invalidateQueries({ queryKey: ['balance'] });
}
