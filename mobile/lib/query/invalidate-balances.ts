import { queryClient } from './client';
import { queryKeys } from './keys';

export function invalidateBalances() {
  queryClient.invalidateQueries({ queryKey: queryKeys.balance.all });
}
