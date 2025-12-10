import { useQuery } from '@tanstack/react-query';
import { AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import type { Hex } from 'viem';
import { getAlchemyInstance } from '@/lib/alchemy';
import type { SupportedChainId } from '@/lib/chains';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { useParaAccount } from './useParaAccount';

export function useTransfers(address?: Hex, chainId: SupportedChainId = DEFAULT_CHAIN.id) {
  const { address: accountAddress } = useParaAccount();

  const targetAddress = address ?? accountAddress;

  return useQuery({
    queryKey: ['transfers', targetAddress, chainId],
    queryFn: async () => {
      if (!targetAddress) return null;
      const alchemy = getAlchemyInstance(chainId);
      return alchemy.core.getAssetTransfers({
        fromAddress: targetAddress,
        category: [
          AssetTransfersCategory.EXTERNAL,
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.ERC20,
          AssetTransfersCategory.ERC721,
          AssetTransfersCategory.ERC1155,
        ],
        order: SortingOrder.DESCENDING,
        withMetadata: true,
      });
    },
    enabled: !!targetAddress,
  });
}
