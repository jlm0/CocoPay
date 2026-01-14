import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { TICKER_MAX_LENGTH } from '@/hooks/useStoreCreationForm';

type TickerInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export function TickerInput({
  value,
  onChangeText,
  onBlur,
  error,
  disabled,
  className = '',
}: TickerInputProps) {
  const handleChange = (text: string) => {
    const cleaned = text.replace(/^\$/, '');
    const filtered = cleaned.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const trimmed = filtered.slice(0, TICKER_MAX_LENGTH);
    const formatted = `$${trimmed}`;
    onChangeText(formatted);
  };

  return (
    <View className={className}>
      <View className="mb-2 flex-row items-center justify-between">
        <Label>Stablecoin Ticker</Label>
        <Text variant="caption" className="text-primary">
          Required
        </Text>
      </View>
      <Input
        value={value}
        onChangeText={handleChange}
        onBlur={onBlur}
        placeholder="Enter ticker, e.g. $ABC"
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!disabled}
        className={error ? 'border-destructive' : ''}
      />
      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}
    </View>
  );
}
