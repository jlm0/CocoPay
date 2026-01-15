import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DiscoverStore, StoreAddress } from '@/types';
import { buildStoreCode } from '@/lib/juicebox/transforms';

const STORE_REGISTRY_KEY = '@cocopay/store-registry';

export interface RegistryStore {
  id: string;
  projectId: number;
  chainId: number;
  suckerGroupId: string;
  name: string;
  tokenSymbol: string;
  storeCode: string;
  description?: string;
  logoUri?: string;
  address?: StoreAddress;
  cashBackPercent: number;
  issuanceCutPercent: number;
}

export interface StoreRegistry {
  stores: RegistryStore[];
  lastSync: number;
}

const registryCache: Map<string, RegistryStore> = new Map();
const storeCodeIndex: Map<string, string> = new Map();

export function getStoreFromRegistrySync(projectId: number, chainId: number): RegistryStore | null {
  const id = `${chainId}-${projectId}`;
  return registryCache.get(id) ?? null;
}

export function getStoreByCodeSync(storeCode: string): RegistryStore | null {
  const id = storeCodeIndex.get(storeCode);
  return id ? (registryCache.get(id) ?? null) : null;
}

export function getAllRegistryStoresSync(): RegistryStore[] {
  return Array.from(registryCache.values());
}

export function getRegistrySize(): number {
  return registryCache.size;
}

function buildRegistryIndex(stores: RegistryStore[]): void {
  registryCache.clear();
  storeCodeIndex.clear();

  for (const store of stores) {
    registryCache.set(store.id, store);
    storeCodeIndex.set(store.storeCode, store.id);
  }
}

export function transformToRegistryStore(discoverStore: DiscoverStore): RegistryStore {
  return {
    id: discoverStore.id,
    projectId: discoverStore.projectId,
    chainId: discoverStore.chainId,
    suckerGroupId: discoverStore.suckerGroupId,
    name: discoverStore.name,
    tokenSymbol: discoverStore.tokenSymbol,
    storeCode: buildStoreCode(BigInt(discoverStore.projectId), discoverStore.chainId),
    description: discoverStore.description,
    logoUri: discoverStore.logoUri,
    address: discoverStore.address,
    cashBackPercent: discoverStore.cashBackPercent,
    issuanceCutPercent: discoverStore.issuanceCutPercent,
  };
}

export function setStoreRegistry(stores: DiscoverStore[]): void {
  const registryStores = stores.map(transformToRegistryStore);
  buildRegistryIndex(registryStores);
}

export function addStoreToRegistry(store: RegistryStore): void {
  registryCache.set(store.id, store);
  storeCodeIndex.set(store.storeCode, store.id);
}

export async function persistStoreRegistry(): Promise<void> {
  try {
    const stores = Array.from(registryCache.values());
    const registry: StoreRegistry = {
      stores,
      lastSync: Date.now(),
    };
    await AsyncStorage.setItem(STORE_REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    // Silent fail - in-memory cache remains valid
  }
}

export async function initializeStoreRegistry(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORE_REGISTRY_KEY);
    if (stored) {
      const registry: StoreRegistry = JSON.parse(stored);
      buildRegistryIndex(registry.stores);
    }
  } catch {
    // Silent fail - registry will be empty until first fetch
  }
}

export async function clearStoreRegistry(): Promise<void> {
  try {
    registryCache.clear();
    storeCodeIndex.clear();
    await AsyncStorage.removeItem(STORE_REGISTRY_KEY);
  } catch {
    // Silent fail
  }
}
