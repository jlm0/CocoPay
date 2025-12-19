import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, isAddress, type Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { queryKeys } from '@/lib/query';

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

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

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.resolveAddress(trimmedInput),
    queryFn: async () => {
      if (!trimmedInput) return null;

      if (isValidAddress) {
        return trimmedInput as Hex;
      }

      if (isEnsName) {
        const normalized = normalize(trimmedInput);
        const address = await mainnetClient.getEnsAddress({ name: normalized });
        return address;
      }

      return null;
    },
    enabled: trimmedInput.length > 0 && (isValidAddress || isEnsName),
    staleTime: 60_000,
    retry: false,
  });

  const hasInput = trimmedInput.length > 0;
  const isValidInput = isValidAddress || isEnsName;
  const resolvedAddress = data ?? null;

  let errorMessage: string | null = null;
  if (hasInput && !isValidInput) {
    errorMessage = 'Enter a valid address or ENS name';
  } else if (error) {
    errorMessage = 'Could not resolve ENS name';
  } else if (hasInput && isEnsName && !isLoading && !resolvedAddress) {
    errorMessage = 'ENS name not found';
  }

  return {
    resolvedAddress,
    isResolving: isLoading,
    isValid: !!resolvedAddress,
    error: errorMessage,
  };
}
