import { queryClient } from './client';
import { queryKeys } from './keys';

export function invalidateStoreRegistry(): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.storeRegistry.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.cocopayRegistry.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.discover.all });
}

export function invalidateAfterPayment(projectId: number, chainId: number): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.balance.all });
  queryClient.invalidateQueries({
    queryKey: queryKeys.bendystraw.participant(projectId, chainId, null),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.bendystraw.project(projectId, chainId),
  });

  invalidateStoreRegistry();
}

export function invalidateAfterStoreCreation(): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.bendystraw.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.projectMetadata.all });

  invalidateStoreRegistry();
}

export function getStoreRegistryQueryKeys() {
  return [
    queryKeys.storeRegistry.all,
    queryKeys.cocopayRegistry.all,
    queryKeys.discover.all,
  ];
}
