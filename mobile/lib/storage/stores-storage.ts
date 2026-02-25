import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Store } from '@/types';

const STORES_STORAGE_KEY = '@cocopay/stores';

export type StoredStores = {
  items: Store[];
  lastUpdated: number;
  address: string;
};

let cachedStores: StoredStores | null = null;

export function getStoredStoresSync(address: string): Store[] {
  if (cachedStores && cachedStores.address.toLowerCase() === address.toLowerCase()) {
    return cachedStores.items;
  }
  return [];
}

export async function getStoredStores(address: string): Promise<Store[]> {
  if (cachedStores && cachedStores.address.toLowerCase() === address.toLowerCase()) {
    return cachedStores.items;
  }

  try {
    const stored = await AsyncStorage.getItem(STORES_STORAGE_KEY);
    if (stored) {
      const parsed: StoredStores = JSON.parse(stored);
      if (parsed.address.toLowerCase() === address.toLowerCase()) {
        cachedStores = parsed;
        return cachedStores.items;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export async function setStoredStores(stores: Store[], address: string): Promise<void> {
  try {
    const stored: StoredStores = {
      items: stores,
      lastUpdated: Date.now(),
      address,
    };
    cachedStores = stored;
    await AsyncStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // ignore
  }
}

export async function clearStoredStores(): Promise<void> {
  try {
    cachedStores = null;
    await AsyncStorage.removeItem(STORES_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function initializeStoresStorage(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORES_STORAGE_KEY);
    if (stored) {
      cachedStores = JSON.parse(stored);
    }
  } catch {
    // ignore
  }
}
