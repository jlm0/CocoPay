import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type HeroAmountInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
};

export function HeroAmountInput({ value, onChangeText, className = '' }: HeroAmountInputProps) {
  const hasValue = value.length > 0 && value !== '$0' && value !== '$';

  return (
    <View className={cn('items-center py-8', className)}>
      <Input
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder="$0"
        className={cn(
          'h-auto w-full border-0 bg-transparent px-0 py-0 text-center font-sans-bold text-5xl shadow-none',
          !hasValue && 'text-muted-foreground/30'
        )}
      />
    </View>
  );
}
