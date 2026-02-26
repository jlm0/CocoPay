import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

type WebsiteInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export function WebsiteInput({
  value,
  onChangeText,
  onBlur,
  error,
  disabled,
  className = '',
}: WebsiteInputProps) {
  return (
    <View className={className}>
      <View className="mb-2 flex-row items-center justify-between">
        <Label>Website</Label>
        <Text variant="fine">Optional</Text>
      </View>
      <View className="flex-row items-center">
        <View className="h-10 justify-center border border-r-0 border-input bg-muted px-3">
          <Text className="text-muted-foreground">https://</Text>
        </View>
        <Input
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder="example.com"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          className={`flex-1 ${error ? 'border-destructive' : ''}`}
        />
      </View>
      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}
    </View>
  );
}
