import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

type NameInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  className?: string;
};

export const NAME_MAX_LENGTH = 50;

export function NameInput({ value, onChangeText, disabled, className = '' }: NameInputProps) {
  return (
    <View className={className}>
      <View className="mb-2 flex-row items-center justify-between">
        <Label>Name</Label>
        <Text variant="caption" className="text-primary">
          Required
        </Text>
      </View>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="Store name"
        editable={!disabled}
        className="text-xl"
      />
    </View>
  );
}
