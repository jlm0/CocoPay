import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type WithdrawalQueueBarProps = {
  queueCount: number;
  totalFormatted: string;
  onWithdraw: () => void;
  isLoading: boolean;
  disabled: boolean;
  className?: string;
};

export function WithdrawalQueueBar({
  queueCount,
  totalFormatted,
  onWithdraw,
  isLoading,
  disabled,
  className,
}: WithdrawalQueueBarProps) {
  const formattedTotal = parseFloat(totalFormatted).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const hasQueue = queueCount > 0;

  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      {hasQueue && (
        <View className="flex-1">
          <Text variant="caption">
            {queueCount} withdrawal{queueCount !== 1 ? 's' : ''}
          </Text>
          <Text className="font-ops">${formattedTotal}</Text>
        </View>
      )}
      <Button
        onPress={onWithdraw}
        disabled={disabled || !hasQueue}
        size="lg"
        className={cn('h-14 rounded-xl', hasQueue ? 'flex-1' : 'w-full')}>
        <Text>{isLoading ? 'Withdrawing...' : hasQueue ? 'Withdraw All' : 'Add withdrawals'}</Text>
      </Button>
    </View>
  );
}
