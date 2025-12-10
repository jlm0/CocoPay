import { View } from 'react-native';
import { Button } from '@/components/ui/button';
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
        <Button
          key={balance.token}
          variant="ghost"
          onPress={() => onBalancePress?.(balance.token)}
          disabled={!onBalancePress}
          className="h-auto flex-1 items-start p-0">
          <CurrencyDisplay label={balance.token} value={formatCurrency(balance.usdValue)} />
        </Button>
      ))}
    </View>
  );
}
