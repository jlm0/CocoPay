import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type FeatureHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function FeatureHeader({ title, subtitle, className }: FeatureHeaderProps) {
  return (
    <View className={cn(className)}>
      <View className="flex-row items-center justify-between">
        <Text variant="title">{title}</Text>
        <Text className="text-2xl">🥥</Text>
      </View>
      {subtitle && <Text variant="caption">{subtitle}</Text>}
    </View>
  );
}
