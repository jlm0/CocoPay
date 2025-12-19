import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const CACHE_BUSTER = 'v1';

function replacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return { __type: 'bigint', value: value.toString() };
  }
  return value;
}

function reviver(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && '__type' in value) {
    const typed = value as { __type: string; value: string };
    if (typed.__type === 'bigint') {
      return BigInt(typed.value);
    }
  }
  return value;
}

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: `@cocopay/react-query-cache-${CACHE_BUSTER}`,
  serialize: (data) => JSON.stringify(data, replacer),
  deserialize: (data) => JSON.parse(data, reviver),
  throttleTime: 1000,
});
