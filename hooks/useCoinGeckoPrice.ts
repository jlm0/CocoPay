import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTokenPrices, type TokenPrices } from '@/lib/coingecko';
import { storePrices } from '@/lib/storage/price-storage';
import { queryKeys } from '@/lib/query';

const STALE_TIME = 300_000;
const GC_TIME = 900_000;
const REFETCH_INTERVAL = 900_000;

export function useCoinGeckoPrice() {
  const query = useQuery<TokenPrices>({
    queryKey: queryKeys.coingecko.prices(),
    queryFn: fetchTokenPrices,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });

  useEffect(() => {
    if (query.data) {
      storePrices(query.data);
    }
  }, [query.data]);

  return query;
}
