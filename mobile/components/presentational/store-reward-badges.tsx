import { View } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type StoreRewardBadgesProps = {
  cashBackPercent: number;
  className?: string;
};

export function StoreRewardBadges({ cashBackPercent, className }: StoreRewardBadgesProps) {
  if (cashBackPercent <= 0) {
    return null;
  }

  return (
    <View className={cn('flex-row gap-2', className)}>
      <Badge variant="secondary" className="">
        <Text>{cashBackPercent}% cashback</Text>
      </Badge>
    </View>
  );
}
