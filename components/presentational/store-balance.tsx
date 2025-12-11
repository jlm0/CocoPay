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
      <Text variant="heading" className="text-4xl">
        {formatBalance(balance)}{' '}
        <Text variant="heading" className="text-4xl text-muted-foreground">
          {tokenSymbol}
        </Text>
      </Text>
    </View>
  );
}
