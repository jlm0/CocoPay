import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TokenPrices } from '@/lib/coingecko';

const PRICE_STORAGE_KEY = '@cocopay/prices';
const PRICE_STALE_TIME = 900_000;

type StoredPrices = TokenPrices & {
  lastUpdated: number;
};

let cachedPrices: StoredPrices | null = null;

export function getStoredPrices(): TokenPrices | null {
  if (cachedPrices && !isPriceStale(cachedPrices.lastUpdated)) {
    return { eth: cachedPrices.eth, usdc: cachedPrices.usdc };
  }
  return null;
}

export async function loadStoredPrices(): Promise<TokenPrices | null> {
  if (cachedPrices) {
    return getStoredPrices();
  }

  try {
    const stored = await AsyncStorage.getItem(PRICE_STORAGE_KEY);
    if (stored) {
      cachedPrices = JSON.parse(stored);
      return getStoredPrices();
    }
  } catch {
    // ignore
  }
  return null;
}

export async function storePrices(prices: TokenPrices): Promise<void> {
  try {
    const stored: StoredPrices = {
      ...prices,
      lastUpdated: Date.now(),
    };
    cachedPrices = stored;
    await AsyncStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // ignore
  }
}

export function isPriceStale(lastUpdated: number): boolean {
  return Date.now() - lastUpdated > PRICE_STALE_TIME;
}

export async function clearPrices(): Promise<void> {
  try {
    cachedPrices = null;
    await AsyncStorage.removeItem(PRICE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function initializePriceStorage(): Promise<void> {
  await loadStoredPrices();
}
