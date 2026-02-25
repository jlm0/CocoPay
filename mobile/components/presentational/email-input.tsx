import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type EmailInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
};

export function EmailInput({ value, onChangeText, className = '' }: EmailInputProps) {
  return (
    <View className={className}>
      <Label className="mb-2">Email</Label>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        className="text-xl"
      />
    </View>
  );
}
