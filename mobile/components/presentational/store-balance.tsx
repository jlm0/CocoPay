import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { formatTokenAmount, CHARACTER_LIMITS } from '@/lib/format';

type StoreBalanceProps = {
  balance: number;
  tokenSymbol: string;
  className?: string;
};

export function StoreBalance({ balance, tokenSymbol, className = '' }: StoreBalanceProps) {
  return (
    <View className={className}>
      <Text variant="caption">Your balance</Text>
      <View className="flex-row items-baseline">
        <Text variant="display">{formatTokenAmount(balance, CHARACTER_LIMITS.STORE_BALANCE)}</Text>
        <Text className="ml-2 font-brutal text-xl text-muted-foreground">{tokenSymbol}</Text>
      </View>
    </View>
  );
}
