import AsyncStorage from '@react-native-async-storage/async-storage';

const BALANCE_STORAGE_KEY = '@cocopay/balances';

export type StoredBalance = {
  raw: string;
  formatted: string;
  lastUpdated: number;
};

export type StoredBalances = {
  usdc: StoredBalance | null;
};

let cachedBalances: StoredBalances | null = null;

export async function getStoredBalances(): Promise<StoredBalances | null> {
  if (cachedBalances) {
    return cachedBalances;
  }

  try {
    const stored = await AsyncStorage.getItem(BALANCE_STORAGE_KEY);
    if (stored) {
      cachedBalances = JSON.parse(stored);
      return cachedBalances;
    }
  } catch {
    // ignore
  }
  return null;
}

export function getStoredBalancesSync(): StoredBalances | null {
  return cachedBalances;
}

export async function storeBalances(balances: Partial<StoredBalances>): Promise<void> {
  try {
    const current = cachedBalances ?? { usdc: null };
    const updated = { ...current, ...balances };
    cachedBalances = updated;
    await AsyncStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export async function storeUsdcBalance(raw: bigint, formatted: string): Promise<void> {
  await storeBalances({
    usdc: {
      raw: raw.toString(),
      formatted,
      lastUpdated: Date.now(),
    },
  });
}

export async function clearBalances(): Promise<void> {
  try {
    cachedBalances = null;
    await AsyncStorage.removeItem(BALANCE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function initializeBalanceStorage(): Promise<void> {
  await getStoredBalances();
}
