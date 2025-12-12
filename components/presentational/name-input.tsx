import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

type NameInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  warning?: string;
  className?: string;
};

export const NAME_MAX_LENGTH = 50;

export function NameInput({ value, onChangeText, warning, className = '' }: NameInputProps) {
  return (
    <View className={className}>
      <Label className="mb-2">Name</Label>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="Store name"
        className="text-xl"
      />
      {warning && <Text className="mt-1 text-sm text-yellow-500">{warning}</Text>}
    </View>
  );
}
