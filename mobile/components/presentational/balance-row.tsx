import { View, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { getChainColor } from '@/lib/chain-ui';
import { CHAIN_NAMES, type SupportedChainId } from '@/lib/constants';
import { cn } from '@/lib/utils';

type BalanceRowProps = {
  balance: string;
  tokenSymbol: string;
  chainId?: SupportedChainId;
  onChainPress?: () => void;
  onMaxPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  showChainSelector?: boolean;
  className?: string;
};

export function BalanceRow({
  balance,
  chainId,
  onChainPress,
  onMaxPress,
  isLoading,
  disabled,
  showChainSelector = false,
  className,
}: BalanceRowProps) {
  const formattedBalance = parseFloat(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const chainName = chainId ? CHAIN_NAMES[chainId] : '';
  const chainColor = chainId ? getChainColor(chainId) : undefined;

  if (isLoading) {
    return (
      <View className={cn('flex-row items-center justify-center gap-2', className)}>
        <Skeleton className="h-4 w-32" />
      </View>
    );
  }

  return (
    <View className={cn('flex-row items-center justify-center gap-1', className)}>
      <Text variant="caption">${formattedBalance}</Text>

      {showChainSelector && chainId && onChainPress ? (
        <Pressable
          onPress={onChainPress}
          disabled={disabled}
          className="flex-row items-center gap-0.5 active:opacity-70">
          <Text variant="caption">on</Text>
          <View className="flex-row items-center gap-1">
            <View className="size-2 rounded-full" style={{ backgroundColor: chainColor }} />
            <Text variant="caption" className="font-mono">
              {chainName}
            </Text>
            <Icon as={ChevronDown} size={12} className="text-muted-foreground" />
          </View>
        </Pressable>
      ) : (
        <Text variant="caption">available</Text>
      )}

      <Text variant="caption">·</Text>

      <Pressable onPress={onMaxPress} disabled={disabled} className="active:opacity-70">
        <Text variant="caption" className="font-brutal text-primary">
          Max
        </Text>
      </Pressable>
    </View>
  );
}
