import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

type SectionHeaderAction = {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
};

type SectionHeaderProps = {
  title: string;
  actions?: SectionHeaderAction[];
  className?: string;
};

export function SectionHeader({ title, actions, className = '' }: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <Text variant="heading">{title}</Text>
      {actions && actions.length > 0 && (
        <View className="flex-row gap-1">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              onPress={action.onPress}
              accessibilityLabel={action.accessibilityLabel}>
              <Icon as={action.icon} size={24} className="text-foreground" />
            </Button>
          ))}
        </View>
      )}
    </View>
  );
}
