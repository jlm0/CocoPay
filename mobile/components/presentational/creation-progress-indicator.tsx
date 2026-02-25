import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type CreationProgressIndicatorProps = {
  label: string;
  className?: string;
};

export function CreationProgressIndicator({ label, className }: CreationProgressIndicatorProps) {
  return (
    <View className={cn('flex-row items-center justify-center gap-3', className)}>
      <Spinner size="small" />
      <Text className="text-muted-foreground">{label}</Text>
    </View>
  );
}
