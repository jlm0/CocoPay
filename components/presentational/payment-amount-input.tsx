import { useMemo } from 'react';
import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
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
  const selectedOption = useMemo<Option>(
    () => ({ value: selectedToken, label: selectedToken }),
    [selectedToken]
  );

  const handleValueChange = (option: Option | undefined) => {
    if (option?.value) {
      onTokenChange(option.value);
    }
  };

  return (
    <View className={className}>
      <Label className="mb-2">Amount</Label>
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <Input
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            placeholder="$0.00"
            className="text-xl"
          />
        </View>
        <Select value={selectedOption} onValueChange={handleValueChange}>
          <SelectTrigger className="min-w-[100px]">
            <SelectValue placeholder="Token" />
          </SelectTrigger>
          <SelectContent>
            {availableTokens.map((token) => (
              <SelectItem key={token} value={token} label={token}>
                {token}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </View>
      {savingsHint && (
        <Text variant="caption" className="mt-2 text-muted-foreground">
          {savingsHint}
        </Text>
      )}
    </View>
  );
}
