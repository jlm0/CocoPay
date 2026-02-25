import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type PayBalanceDisplayProps = {
  balance: number;
  isLoading?: boolean;
  className?: string;
};

export function PayBalanceDisplay({ balance, isLoading, className = '' }: PayBalanceDisplayProps) {
  const formattedBalance = balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (isLoading) {
    return (
      <View className={cn('items-center', className)}>
        <Skeleton className="h-5 w-32 rounded" />
      </View>
    );
  }

  return (
    <View className={cn('items-center', className)}>
      <Text variant="caption">Balance: ${formattedBalance} USDC</Text>
    </View>
  );
}
