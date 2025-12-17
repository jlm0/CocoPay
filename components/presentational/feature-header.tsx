import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type FeatureHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  onCoconutPress?: () => void;
  className?: string;
};

export function FeatureHeader({
  title,
  subtitle,
  badge,
  onCoconutPress,
  className,
}: FeatureHeaderProps) {
  return (
    <View className={cn(className)}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text variant="title">{title}</Text>
          {badge && (
            <View className="rounded bg-primary/10 px-1.5 py-0.5">
              <Text className="font-sans-semibold text-xs text-primary">{badge}</Text>
            </View>
          )}
        </View>
        {onCoconutPress ? (
          <Pressable onPress={onCoconutPress} hitSlop={12} className="active:opacity-70">
            <Text className="text-2xl">🥥</Text>
          </Pressable>
        ) : (
          <Text className="text-2xl">🥥</Text>
        )}
      </View>
      {subtitle && <Text variant="caption">{subtitle}</Text>}
    </View>
  );
}
