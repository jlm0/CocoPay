import { View } from 'react-native';
import { Text } from '@/components/ui/text';

type StoreBalanceProps = {
  balance: number;
  tokenSymbol: string;
  className?: string;
};

export function StoreBalance({ balance, tokenSymbol, className = '' }: StoreBalanceProps) {
  const formatBalance = (value: number) => {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  return (
    <View className={className}>
      <Text variant="caption">Your balance</Text>
      <Text variant="display">
        {formatBalance(balance)}{' '}
        <Text variant="display" className="text-muted-foreground">
          {tokenSymbol}
        </Text>
      </Text>
    </View>
  );
}
