import { View } from 'react-native';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

type DescriptionInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
};

export function DescriptionInput({ value, onChangeText, className = '' }: DescriptionInputProps) {
  return (
    <View className={className}>
      <View className="mb-2 flex-row items-center justify-between">
        <Label>Description</Label>
        <Text variant="caption">Optional</Text>
      </View>
      <Textarea
        value={value}
        onChangeText={onChangeText}
        placeholder="Tell customers about your store..."
        numberOfLines={4}
      />
    </View>
  );
}
