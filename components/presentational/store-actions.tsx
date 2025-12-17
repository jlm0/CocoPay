import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type StoreActionsProps = {
  isOwned: boolean;
  disabled?: boolean;
  onBorrowPress?: () => void;
  onCashOutPress?: () => void;
  onSpendPress?: () => void;
  onChargePress?: () => void;
  className?: string;
};

export function StoreActions({
  isOwned,
  disabled,
  onBorrowPress,
  onCashOutPress,
  onSpendPress,
  onChargePress,
  className = '',
}: StoreActionsProps) {
  return (
    <View className={`gap-3 ${className}`}>
      <Button
        variant="secondary"
        onPress={onBorrowPress}
        disabled
        size="lg"
        className="h-14 rounded-xl">
        <Text>Borrow (Coming soon)</Text>
      </Button>

      <Button
        variant="secondary"
        onPress={onCashOutPress}
        disabled={disabled}
        size="lg"
        className="h-14 rounded-xl">
        <Text>Cash out</Text>
      </Button>

      <Button
        onPress={isOwned ? onChargePress : onSpendPress}
        disabled={disabled}
        size="lg"
        className="h-14 rounded-xl">
        <Text>{isOwned ? 'Charge' : 'Spend at store'}</Text>
      </Button>
    </View>
  );
}
