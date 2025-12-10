import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

type StoreCodeInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  storeName?: string;
  className?: string;
};

export function StoreCodeInput({
  value,
  onChangeText,
  storeName,
  className = '',
}: StoreCodeInputProps) {
  return (
    <View className={className}>
      <Label className="mb-2 font-semibold">Store Code</Label>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="eth:00"
        autoCapitalize="none"
        autoCorrect={false}
        className="text-xl"
      />
      {storeName && (
        <Text variant="caption" className="mt-1 text-muted-foreground">
          {storeName}
        </Text>
      )}
    </View>
  );
}
