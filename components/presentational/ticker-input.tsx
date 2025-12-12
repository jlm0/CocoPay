import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

type TickerInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  warning?: string;
  className?: string;
};

export const TICKER_MAX_LENGTH = 5;

export function TickerInput({ value, onChangeText, warning, className = '' }: TickerInputProps) {
  const handleChange = (text: string) => {
    const cleaned = text.replace(/^\$/, '');
    const formatted = `$${cleaned.toUpperCase()}`;
    onChangeText(formatted);
  };

  return (
    <View className={className}>
      <Label className="mb-2">Stablecoin ticker</Label>
      <Input
        value={value}
        onChangeText={handleChange}
        placeholder="$ABC"
        autoCapitalize="characters"
        autoCorrect={false}
        className="text-xl"
      />
      {warning && <Text className="mt-1 text-sm text-yellow-500">{warning}</Text>}
    </View>
  );
}
