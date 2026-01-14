import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { NAME_MAX_LENGTH } from '@/hooks/useStoreCreationForm';

type NameInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export function NameInput({
  value,
  onChangeText,
  onBlur,
  error,
  disabled,
  className = '',
}: NameInputProps) {
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
        onBlur={onBlur}
        placeholder="Enter your store name"
        maxLength={NAME_MAX_LENGTH}
        editable={!disabled}
        className={error ? 'border-destructive' : ''}
      />
      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}
    </View>
  );
}
