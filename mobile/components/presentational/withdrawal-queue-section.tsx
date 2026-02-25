import { View } from 'react-native';
import { formatUnits } from 'viem';
import { WithdrawalQueueItem } from './withdrawal-queue-item';
import { Text } from '@/components/ui/text';
import { TOKEN_DECIMALS, type SupportedChainId } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { WithdrawalQueueItem as QueueItemType } from '@/hooks/useWithdrawQueue';

type WithdrawalQueueSectionProps = {
  queue: QueueItemType[];
  onRemoveItem: (chainId: SupportedChainId) => void;
  disabled?: boolean;
  className?: string;
};

export function WithdrawalQueueSection({
  queue,
  onRemoveItem,
  disabled,
  className,
}: WithdrawalQueueSectionProps) {
  if (queue.length === 0) {
    return null;
  }

  return (
    <View className={cn(className)}>
      <Text variant="label" className="mb-3">
        Withdrawal Queue ({queue.length})
      </Text>
      <View className="gap-2">
        {queue.map((item) => {
          const formatted = formatUnits(item.amount, TOKEN_DECIMALS.USDC);
          return (
            <WithdrawalQueueItem
              key={item.chainId}
              chainId={item.chainId}
              amount={formatted}
              onRemove={() => onRemoveItem(item.chainId)}
              disabled={disabled}
            />
          );
        })}
      </View>
    </View>
  );
}
