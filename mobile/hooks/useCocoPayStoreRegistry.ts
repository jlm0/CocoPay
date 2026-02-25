import { useEffect } from 'react';
import { useDiscoverStores } from '@/hooks/useDiscoverStores';
import {
  getStoreFromRegistrySync,
  getStoreByCodeSync,
  getAllRegistryStoresSync,
  getRegistrySize,
  setStoreRegistry,
  persistStoreRegistry,
  type RegistryStore,
} from '@/lib/storage';

interface UseCocoPayStoreRegistryResult {
  getStoreById: (projectId: number, chainId: number) => RegistryStore | null;
  getStoreByCode: (storeCode: string) => RegistryStore | null;
  getAllStores: () => RegistryStore[];
  isHydrated: boolean;
  isLoading: boolean;
  storeCount: number;
  refetch: () => void;
}

export function useCocoPayStoreRegistry(): UseCocoPayStoreRegistryResult {
  const { stores, isLoading, refetch } = useDiscoverStores();

  useEffect(() => {
    if (stores.length > 0) {
      setStoreRegistry(stores);
      persistStoreRegistry();
    }
  }, [stores]);

  const storeCount = getRegistrySize();
  const isHydrated = storeCount > 0 || stores.length > 0;

  return {
    getStoreById: getStoreFromRegistrySync,
    getStoreByCode: getStoreByCodeSync,
    getAllStores: getAllRegistryStoresSync,
    isHydrated,
    isLoading,
    storeCount,
    refetch,
  };
}
