import { View, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { getChainColor } from '@/lib/chain-ui';
import { CHAIN_NAMES, type SupportedChainId } from '@/lib/constants';
import { cn } from '@/lib/utils';

type WithdrawBalanceInfoProps = {
  balance: string;
  chainId?: SupportedChainId;
  onChainPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  canChangeChain?: boolean;
  className?: string;
};

export function WithdrawBalanceInfo({
  balance,
  chainId,
  onChainPress,
  isLoading,
  disabled,
  canChangeChain = false,
  className,
}: WithdrawBalanceInfoProps) {
  const formattedBalance = parseFloat(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const chainName = chainId ? CHAIN_NAMES[chainId] : '';
  const chainColor = chainId ? getChainColor(chainId) : undefined;

  if (isLoading) {
    return (
      <View className={cn('flex-row items-center justify-between', className)}>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </View>
    );
  }

  return (
    <View className={cn('flex-row items-center justify-between', className)}>
      {/* Left: Available balance */}
      <Text variant="caption">${formattedBalance} available</Text>

      {/* Right: Chain selector */}
      {canChangeChain && chainId && onChainPress ? (
        <Pressable
          onPress={onChainPress}
          disabled={disabled}
          className="flex-row items-center gap-1.5 active:opacity-70">
          <View className="size-2 rounded-full" style={{ backgroundColor: chainColor }} />
          <Text variant="caption" className="font-mono">
            {chainName}
          </Text>
          <Icon as={ChevronDown} size={12} className="text-muted-foreground" />
        </Pressable>
      ) : chainId ? (
        <View className="flex-row items-center gap-1.5">
          <View className="size-2 rounded-full" style={{ backgroundColor: chainColor }} />
          <Text variant="caption" className="font-mono">
            {chainName}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
