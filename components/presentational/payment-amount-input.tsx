import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

type PaymentToken = 'USDC' | 'ETH' | string;

type PaymentAmountInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  selectedToken: PaymentToken;
  onTokenChange: (token: PaymentToken) => void;
  availableTokens: PaymentToken[];
  savingsHint?: string;
  className?: string;
};

export function PaymentAmountInput({
  value,
  onChangeText,
  selectedToken,
  onTokenChange,
  availableTokens,
  savingsHint,
  className = '',
}: PaymentAmountInputProps) {
  return (
    <View className={className}>
      <Label className="mb-2 font-semibold">Amount</Label>
      <View className="flex-row items-start">
        <View className="flex-1">
          <Input
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            placeholder="$0.00"
            className="text-xl"
          />
        </View>
        <View className="ml-4 overflow-hidden rounded border border-border">
          {availableTokens.map((token) => (
            <Button
              key={token}
              variant="ghost"
              onPress={() => onTokenChange(token)}
              className={`h-auto rounded-none px-4 py-2 ${selectedToken === token ? 'bg-muted' : ''}`}>
              <Text
                variant="caption"
                className={selectedToken === token ? 'font-semibold' : 'text-muted-foreground'}>
                {token}
              </Text>
            </Button>
          ))}
        </View>
      </View>
      {savingsHint && (
        <Text variant="caption" className="mt-2 text-muted-foreground">
          {savingsHint}
        </Text>
      )}
    </View>
  );
}
