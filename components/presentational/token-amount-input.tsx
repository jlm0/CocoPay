import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

type TokenAmountInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  tokenSymbol: string;
  balance: number;
  label?: string;
  showTokenInBalance?: boolean;
  className?: string;
};

export function TokenAmountInput({
  value,
  onChangeText,
  tokenSymbol,
  balance,
  label = 'Amount',
  showTokenInBalance = false,
  className = '',
}: TokenAmountInputProps) {
  const formatBalance = (val: number) => {
    if (showTokenInBalance) {
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  return (
    <View className={className}>
      <Label className="mb-2 font-semibold">{label}</Label>
      <View className="flex-row items-center gap-2">
        <Input
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder="0"
          className="flex-1 text-2xl font-semibold"
        />
        <Text variant="body" className="text-xl text-muted-foreground">
          {tokenSymbol}
        </Text>
      </View>
      <Text variant="caption" className="mt-1 text-muted-foreground">
        Balance: {formatBalance(balance)}
        {showTokenInBalance ? ` ${tokenSymbol}` : ''}
      </Text>
    </View>
  );
}
