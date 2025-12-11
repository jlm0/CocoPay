import { View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

type SectionHeaderProps = {
  title: string;
  showAddButton?: boolean;
  onAddPress?: () => void;
  className?: string;
};

export function SectionHeader({
  title,
  showAddButton = false,
  onAddPress,
  className = '',
}: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <Text variant="heading" className="font-sans-semibold text-xl">
        {title}
      </Text>
      {showAddButton && (
        <Button variant="ghost" size="icon" onPress={onAddPress}>
          <Icon as={Plus} size={24} className="text-foreground" />
        </Button>
      )}
    </View>
  );
}
