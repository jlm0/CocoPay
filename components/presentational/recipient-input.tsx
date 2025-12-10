import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RecipientInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
};

export function RecipientInput({ value, onChangeText, className = '' }: RecipientInputProps) {
  return (
    <View className={className}>
      <Label className="mb-2 font-semibold">Recipient</Label>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="Address or ENS"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
