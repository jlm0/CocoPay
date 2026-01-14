import { View } from 'react-native';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { DESCRIPTION_MAX_LENGTH } from '@/hooks/useStoreCreationForm';

type DescriptionInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export function DescriptionInput({
  value,
  onChangeText,
  onBlur,
  error,
  disabled,
  className = '',
}: DescriptionInputProps) {
  return (
    <View className={className}>
      <View className="mb-2 flex-row items-center justify-between">
        <Label>Description</Label>
        <Text variant="fine">Optional</Text>
      </View>
      <Textarea
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder="Describe your store to customers"
        numberOfLines={4}
        maxLength={DESCRIPTION_MAX_LENGTH}
        editable={!disabled}
        className={error ? 'border-destructive' : ''}
      />
      <View className="mt-1 flex-row items-center justify-between">
        {error ? <Text className="text-sm text-destructive">{error}</Text> : <View />}
        <Text variant="fine">
          {value.length}/{DESCRIPTION_MAX_LENGTH}
        </Text>
      </View>
    </View>
  );
}
