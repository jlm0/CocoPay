import { queryClient } from './client';
import { queryKeys } from './keys';

export function invalidateAfterPay(projectId: number, chainId: number) {
  queryClient.invalidateQueries({ queryKey: queryKeys.balance.all });
  queryClient.invalidateQueries({
    queryKey: queryKeys.bendystraw.participant(projectId, chainId, null),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.bendystraw.project(projectId, chainId),
  });
}

export function invalidateAfterCashOut(projectId: number, chainId: number) {
  queryClient.invalidateQueries({ queryKey: queryKeys.balance.all });
  queryClient.invalidateQueries({
    queryKey: queryKeys.bendystraw.participant(projectId, chainId, null),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.bendystraw.project(projectId, chainId),
  });
}

export function invalidateAfterWithdraw() {
  queryClient.invalidateQueries({ queryKey: queryKeys.balance.all });
}

export function refetchAfterStoreCreate() {
  Promise.all([
    queryClient.refetchQueries({ queryKey: queryKeys.bendystraw.all }),
    queryClient.refetchQueries({ queryKey: queryKeys.projectMetadata.all }),
    queryClient.refetchQueries({ queryKey: queryKeys.cocopayRegistry.all }),
  ]);
}
