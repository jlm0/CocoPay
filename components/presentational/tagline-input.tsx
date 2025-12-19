import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

type TaglineInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  warning?: string;
  className?: string;
};

export const TAGLINE_MAX_LENGTH = 80;

export function TaglineInput({ value, onChangeText, warning, className = '' }: TaglineInputProps) {
  return (
    <View className={className}>
      <View className="mb-2 flex-row items-center justify-between">
        <Label>Tagline</Label>
        <Text variant="caption">
          {value.length}/{TAGLINE_MAX_LENGTH}
        </Text>
      </View>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="Short catchphrase for your store"
        maxLength={TAGLINE_MAX_LENGTH}
      />
      {warning && <Text className="mt-1 text-sm text-yellow-500">{warning}</Text>}
    </View>
  );
}
