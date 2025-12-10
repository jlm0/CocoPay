import { View } from 'react-native';
import { Text } from '@/components/ui/text';

type BalanceDisplayProps = {
  amount: number;
  tokenSymbol: string;
  className?: string;
};

export function BalanceDisplay({ amount, tokenSymbol, className = '' }: BalanceDisplayProps) {
  const formatAmount = (value: number) => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <View className={className}>
      <Text variant="caption" className="text-gray-500">
        Balance
      </Text>
      <Text variant="heading" className="text-4xl">
        {formatAmount(amount)}{' '}
        <Text variant="heading" className="text-4xl text-gray-500">
          {tokenSymbol}
        </Text>
      </Text>
    </View>
  );
}
