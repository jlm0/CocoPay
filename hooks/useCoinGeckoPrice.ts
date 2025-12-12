import { useQuery } from '@tanstack/react-query';
import { fetchTokenPrices, type TokenPrices } from '@/lib/coingecko';
import { getStoredPrices, storePrices } from '@/lib/storage/price-storage';

const STALE_TIME = 300_000;
const GC_TIME = 900_000;
const REFETCH_INTERVAL = 900_000;

export function useCoinGeckoPrice() {
  return useQuery<TokenPrices>({
    queryKey: ['coingecko', 'prices'],
    queryFn: async () => {
      const prices = await fetchTokenPrices();
      await storePrices(prices);
      return prices;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchInterval: REFETCH_INTERVAL,
    initialData: () => {
      const stored = getStoredPrices();
      return stored ?? undefined;
    },
    initialDataUpdatedAt: () => {
      return Date.now() - STALE_TIME;
    },
  });
}
