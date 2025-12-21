import { View } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type StoreRewardBadgesProps = {
  cashBackPercent: number;
  loyaltyBonusPercent: number;
  className?: string;
};

export function StoreRewardBadges({
  cashBackPercent,
  loyaltyBonusPercent,
  className,
}: StoreRewardBadgesProps) {
  const showCashBack = cashBackPercent > 0;
  const showLoyalty = loyaltyBonusPercent > 0;

  if (!showCashBack && !showLoyalty) {
    return null;
  }

  return (
    <View className={cn('flex-row gap-2', className)}>
      {showCashBack && (
        <Badge variant="secondary" className="rounded-full">
          <Text>{cashBackPercent}% cashback</Text>
        </Badge>
      )}
      {showLoyalty && (
        <Badge variant="secondary" className="rounded-full">
          <Text>{loyaltyBonusPercent}% loyalty</Text>
        </Badge>
      )}
    </View>
  );
}
