import { View, Pressable } from 'react-native';
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
  onMaxPress?: () => void;
  error?: string;
  className?: string;
};

export function TokenAmountInput({
  value,
  onChangeText,
  tokenSymbol,
  balance,
  label = 'Amount',
  showTokenInBalance = false,
  onMaxPress,
  error,
  className = '',
}: TokenAmountInputProps) {
  const formatBalance = (val: number) => {
    if (showTokenInBalance) {
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    }
    return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const handleChangeText = (text: string) => {
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : filtered;
    onChangeText(sanitized);
  };

  return (
    <View className={className}>
      <Label className="mb-2 font-brutal">{label}</Label>
      <View className="flex-row items-center gap-2">
        <Input
          value={value}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          placeholder="0"
          className={`flex-1 font-brutal text-2xl ${error ? 'border-destructive' : ''}`}
        />
        {onMaxPress && (
          <Pressable
            onPress={onMaxPress}
            className="rounded-lg bg-secondary px-3 py-2 active:bg-secondary/60">
            <Text variant="caption" className="font-brutal text-secondary-foreground">
              Max
            </Text>
          </Pressable>
        )}
        <Text variant="body" className="text-xl text-muted-foreground">
          {tokenSymbol}
        </Text>
      </View>
      {error ? (
        <Text variant="small" className="mt-1 text-destructive">
          {error}
        </Text>
      ) : (
        <Text variant="caption" className="mt-1 text-muted-foreground">
          Balance: {formatBalance(balance)}
          {showTokenInBalance ? ` ${tokenSymbol}` : ''}
        </Text>
      )}
    </View>
  );
}
