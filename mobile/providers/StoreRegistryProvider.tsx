import { useCocoPayStoreRegistry } from '@/hooks/useCocoPayStoreRegistry';

export function StoreRegistryHydrator() {
  useCocoPayStoreRegistry();
  return null;
}
