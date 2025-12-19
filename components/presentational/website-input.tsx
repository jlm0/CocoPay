import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

type WebsiteInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  className?: string;
};

export function WebsiteInput({ value, onChangeText, error, className = '' }: WebsiteInputProps) {
  return (
    <View className={className}>
      <View className="mb-2 flex-row items-center justify-between">
        <Label>Website</Label>
        <Text variant="caption">Optional</Text>
      </View>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="https://yourstore.com"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}
    </View>
  );
}
