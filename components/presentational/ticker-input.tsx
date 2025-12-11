import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type TickerInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
};

export function TickerInput({ value, onChangeText, className = '' }: TickerInputProps) {
  const handleChange = (text: string) => {
    const formatted = text.startsWith('$') ? text.toUpperCase() : `$${text.toUpperCase()}`;
    onChangeText(formatted);
  };

  return (
    <View className={className}>
      <Label className="mb-2 font-sans-semibold">Stablecoin ticker</Label>
      <Input
        value={value}
        onChangeText={handleChange}
        placeholder="$ABC"
        autoCapitalize="characters"
        autoCorrect={false}
        className="text-xl"
      />
    </View>
  );
}
