import { View, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import type { SortOption } from '@/types';

type DiscoverSortContentProps = {
  value: SortOption;
  onValueChange: (option: SortOption) => void;
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'cashback', label: 'Highest Cashback' },
];

export function DiscoverSortContent({ value, onValueChange }: DiscoverSortContentProps) {
  return (
    <View className="gap-1">
      <Text variant="heading" className="mb-2">
        Sort by
      </Text>
      {SORT_OPTIONS.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onValueChange(option.value)}
          className="flex-row items-center justify-between rounded-lg px-3 py-3 active:bg-muted">
          <Text className={value === option.value ? 'font-sans-semibold' : ''}>{option.label}</Text>
          {value === option.value && <Icon as={Check} size={20} className="text-primary" />}
        </Pressable>
      ))}
    </View>
  );
}
