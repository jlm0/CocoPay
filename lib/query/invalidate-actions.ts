import { queryClient } from './client';
import { queryKeys } from './keys';
import { invalidateStoreRegistry } from './registry-refresh';

export function invalidateAfterPay(projectId: number, chainId: number) {
  queryClient.invalidateQueries({ queryKey: queryKeys.balance.all });
  queryClient.invalidateQueries({
    queryKey: queryKeys.bendystraw.participant(projectId, chainId, null),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.bendystraw.project(projectId, chainId),
  });
  invalidateStoreRegistry();
}

export function invalidateAfterCashOut(projectId: number, chainId: number) {
  queryClient.invalidateQueries({ queryKey: queryKeys.balance.all });
  queryClient.invalidateQueries({
    queryKey: queryKeys.bendystraw.participant(projectId, chainId, null),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.bendystraw.project(projectId, chainId),
  });
  invalidateStoreRegistry();
}

export function invalidateAfterWithdraw() {
  queryClient.invalidateQueries({ queryKey: queryKeys.balance.all });
}

export function refetchAfterStoreCreate() {
  queryClient.refetchQueries({ queryKey: queryKeys.bendystraw.all });
  queryClient.refetchQueries({ queryKey: queryKeys.projectMetadata.all });
  invalidateStoreRegistry();
}
