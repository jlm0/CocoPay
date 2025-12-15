import { View } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type HeroAmountInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  isEditable?: boolean;
  onEditPress?: () => void;
  className?: string;
};

export function HeroAmountInput({
  value,
  onChangeText,
  isEditable = true,
  onEditPress,
  className = '',
}: HeroAmountInputProps) {
  const hasValue = value.length > 0 && value !== '$0' && value !== '$';

  if (!isEditable) {
    return (
      <View className={cn('items-center py-8', className)}>
        <View className="flex-row items-center gap-2">
          <Text className="font-sans-bold text-5xl">{value || '$0'}</Text>
          {onEditPress && (
            <Button variant="ghost" size="icon" onPress={onEditPress} className="h-10 w-10">
              <Icon as={Pencil} size={20} className="text-muted-foreground" />
            </Button>
          )}
        </View>
      </View>
    );
  }

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
