import { View, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { getChainColor, getChainColorMuted } from '@/lib/chain-ui';
import { CHAIN_NAMES, type SupportedChainId } from '@/lib/constants';
import { cn } from '@/lib/utils';

type WithdrawalQueueItemProps = {
  chainId: SupportedChainId;
  amount: string;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
};

export function WithdrawalQueueItem({
  chainId,
  amount,
  onRemove,
  disabled,
  className,
}: WithdrawalQueueItemProps) {
  const chainName = CHAIN_NAMES[chainId];
  const chainColor = getChainColor(chainId);
  const chainColorMuted = getChainColorMuted(chainId);

  const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View
      className={cn(
        'flex-row items-center justify-between rounded-xl border border-border bg-card p-3',
        className
      )}>
      <View className="flex-row items-center gap-3">
        <View
          className="size-8 items-center justify-center rounded-full"
          style={{ backgroundColor: chainColorMuted }}>
          <View className="size-3 rounded-full" style={{ backgroundColor: chainColor }} />
        </View>
        <Text className="font-mono">{chainName}</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Text className="font-ops">${formattedAmount}</Text>
        <Pressable
          onPress={onRemove}
          disabled={disabled}
          className={cn(
            'size-7 items-center justify-center rounded-full bg-muted active:bg-muted/70',
            disabled && 'opacity-50'
          )}>
          <Icon as={X} size={14} className="text-muted-foreground" />
        </Pressable>
      </View>
    </View>
  );
}
