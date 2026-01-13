import { forwardRef } from 'react';
import { View, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { BottomSheet, type BottomSheetMethods } from '@/components/ui/bottom-sheet';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { getChainColor, getChainColorMuted } from '@/lib/chain-ui';
import { CHAIN_NAMES, type SupportedChainId } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { ChainBalance } from '@/hooks/useMultiChainUsdcBalance';

type ChainSelectorSheetProps = {
  selectedChainId: SupportedChainId;
  balances: ChainBalance[];
  onSelect: (chainId: SupportedChainId) => void;
};

export const ChainSelectorSheet = forwardRef<BottomSheetMethods, ChainSelectorSheetProps>(
  ({ selectedChainId, balances, onSelect }, ref) => {
    const chainsWithBalance = balances.filter((b) => b.balance > 0n);

    return (
      <BottomSheet ref={ref}>
        <Text variant="heading" className="mb-4">
          Select Network
        </Text>
        <View className="gap-2">
          {chainsWithBalance.map((chainBalance) => {
            const isSelected = chainBalance.chainId === selectedChainId;
            const chainColor = getChainColor(chainBalance.chainId);
            const chainColorMuted = getChainColorMuted(chainBalance.chainId);
            const chainName = CHAIN_NAMES[chainBalance.chainId];

            const formattedBalance = parseFloat(chainBalance.formatted).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            return (
              <Pressable
                key={chainBalance.chainId}
                onPress={() => onSelect(chainBalance.chainId)}
                className={cn(
                  'flex-row items-center justify-between rounded-xl border border-border p-4 active:opacity-70',
                  isSelected && 'border-primary bg-primary/5'
                )}>
                <View className="flex-row items-center gap-3">
                  <View
                    className="size-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: chainColorMuted }}>
                    <View className="size-4 rounded-full" style={{ backgroundColor: chainColor }} />
                  </View>
                  <View>
                    <Text className="font-sans-semibold">{chainName}</Text>
                    <Text variant="caption">${formattedBalance} available</Text>
                  </View>
                </View>
                {isSelected && <Icon as={Check} size={20} className="text-primary" />}
              </Pressable>
            );
          })}
        </View>
        {chainsWithBalance.length === 0 && (
          <Text variant="caption" className="text-center">
            No chains with balance available
          </Text>
        )}
      </BottomSheet>
    );
  }
);

ChainSelectorSheet.displayName = 'ChainSelectorSheet';
