import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type NameInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
};

export function NameInput({ value, onChangeText, className = '' }: NameInputProps) {
  return (
    <View className={className}>
      <Label className="mb-2 font-semibold">Name</Label>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder="Store name"
        className="text-xl"
      />
    </View>
  );
}
