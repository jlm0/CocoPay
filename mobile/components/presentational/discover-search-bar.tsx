import { View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

type DiscoverSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function DiscoverSearchBar({
  value,
  onChangeText,
  placeholder = 'Search stores...',
}: DiscoverSearchBarProps) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1 flex-row items-center rounded-lg border border-border bg-background px-3">
        <Icon as={Search} size={20} className="text-muted-foreground" />
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          className="flex-1 border-0 bg-transparent"
          placeholderTextColor="#9CA3AF"
        />
        {value.length > 0 && (
          <Button variant="ghost" size="icon" onPress={() => onChangeText('')}>
            <Icon as={X} size={18} className="text-muted-foreground" />
          </Button>
        )}
      </View>
    </View>
  );
}
