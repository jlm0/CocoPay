import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type StoreActionsProps = {
  isOwned: boolean;
  onBorrowPress?: () => void;
  onCashOutPress?: () => void;
  onSpendPress?: () => void;
  onChargePress?: () => void;
  className?: string;
};

export function StoreActions({
  isOwned,
  onBorrowPress,
  onCashOutPress,
  onSpendPress,
  onChargePress,
  className = '',
}: StoreActionsProps) {
  return (
    <View className={`gap-3 ${className}`}>
      <Button variant="secondary" onPress={onBorrowPress} className="h-14 rounded-xl">
        <Text className="font-semibold text-secondary-foreground">Borrow</Text>
      </Button>

      <Button variant="secondary" onPress={onCashOutPress} className="h-14 rounded-xl">
        <Text className="font-semibold text-secondary-foreground">Cash out</Text>
      </Button>

      <Button onPress={isOwned ? onChargePress : onSpendPress} className="h-14 rounded-xl">
        <Text className="font-semibold text-primary-foreground">
          {isOwned ? 'Charge' : 'Spend at store'}
        </Text>
      </Button>
    </View>
  );
}
