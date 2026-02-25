import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, isAddress, type Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { queryKeys } from '@/lib/query';
import { useDebounce } from '@/hooks/useDebounce';

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const ENS_DEBOUNCE_MS = 500;

type UseResolveAddressResult = {
  resolvedAddress: Hex | null;
  isResolving: boolean;
  isValid: boolean;
  error: string | null;
};

export function useResolveAddress(input: string): UseResolveAddressResult {
  const trimmedInput = input.trim();
  const isEnsName = trimmedInput.toLowerCase().endsWith('.eth');
  const isValidAddress = isAddress(trimmedInput);

  const debouncedInput = useDebounce(trimmedInput, isEnsName ? ENS_DEBOUNCE_MS : 0);
  const debouncedIsEns = debouncedInput.toLowerCase().endsWith('.eth');

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.resolveAddress(debouncedInput),
    queryFn: async () => {
      if (!debouncedInput) return null;

      if (isAddress(debouncedInput)) {
        return debouncedInput as Hex;
      }

      if (debouncedIsEns) {
        const normalized = normalize(debouncedInput);
        const address = await mainnetClient.getEnsAddress({ name: normalized });
        return address;
      }

      return null;
    },
    enabled: debouncedInput.length > 0 && (isAddress(debouncedInput) || debouncedIsEns),
    staleTime: 60_000,
    retry: false,
  });

  const isDebouncing = isEnsName && trimmedInput !== debouncedInput;

  const hasInput = trimmedInput.length > 0;
  const isValidInput = isValidAddress || isEnsName;
  const resolvedAddress = data ?? null;

  let errorMessage: string | null = null;
  if (hasInput && !isValidInput) {
    errorMessage = 'Enter a valid address or ENS name';
  } else if (error) {
    errorMessage = 'Could not resolve ENS name';
  } else if (hasInput && isEnsName && !isLoading && !isDebouncing && !resolvedAddress) {
    errorMessage = 'ENS name not found';
  }

  return {
    resolvedAddress,
    isResolving: isLoading || isDebouncing,
    isValid: !!resolvedAddress,
    error: errorMessage,
  };
}
