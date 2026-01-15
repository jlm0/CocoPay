import { Pressable, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

type SectionHeaderIconAction = {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
};

type SectionHeaderTextAction = {
  label: string;
  onPress: () => void;
};

type SectionHeaderProps = {
  title: string;
  actions?: SectionHeaderIconAction[];
  action?: SectionHeaderTextAction;
  className?: string;
};

export function SectionHeader({ title, actions, action, className = '' }: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <Text variant="heading">{title}</Text>
      {action && (
        <Pressable onPress={action.onPress} className="active:opacity-70">
          <Text className="font-sans-medium text-sm text-primary">{action.label}</Text>
        </Pressable>
      )}
      {actions && actions.length > 0 && (
        <View className="flex-row gap-1">
          {actions.map((iconAction, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              onPress={iconAction.onPress}
              accessibilityLabel={iconAction.accessibilityLabel}>
              <Icon as={iconAction.icon} size={24} className="text-foreground" />
            </Button>
          ))}
        </View>
      )}
    </View>
  );
}
