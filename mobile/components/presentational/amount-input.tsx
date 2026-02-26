import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AmountInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
};

export function AmountInput({ value, onChangeText, className = '' }: AmountInputProps) {
  return (
    <View className={className}>
      <Label className="mb-2 font-brutal">Amount</Label>
      <Input
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder="$0.00"
        className="text-xl"
      />
    </View>
  );
}
