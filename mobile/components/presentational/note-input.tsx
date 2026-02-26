import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type NoteInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
};

export function NoteInput({ value, onChangeText, className = '' }: NoteInputProps) {
  return (
    <View className={className}>
      <Label className="mb-2 font-brutal">Note</Label>
      <Input value={value} onChangeText={onChangeText} placeholder="Add a note" />
    </View>
  );
}
