import { View, Pressable } from 'react-native';
import { CurrencyDisplay } from './currency-display';
import type { Balance } from '@/types';

type BalanceCardProps = {
  balances: Balance[];
  onBalancePress?: (token: string) => void;
  className?: string;
};

export function BalanceCard({ balances, onBalancePress, className = '' }: BalanceCardProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <View className={`flex-row justify-between ${className}`}>
      {balances.map((balance) => (
        <Pressable
          key={balance.token}
          onPress={() => onBalancePress?.(balance.token)}
          disabled={!onBalancePress}
          className="flex-1">
          <CurrencyDisplay label={balance.token} value={formatCurrency(balance.usdValue)} />
        </Pressable>
      ))}
    </View>
  );
}
