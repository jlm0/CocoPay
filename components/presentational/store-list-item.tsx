import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { Store } from '@/types';

type StoreListItemProps = {
  store: Store;
  onPress?: () => void;
};

export function StoreListItem({ store, onPress }: StoreListItemProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Button
      variant="ghost"
      onPress={onPress}
      disabled={!onPress}
      className="h-auto justify-start py-3">
      <Text variant="body">
        <Text variant="body" className="font-semibold">
          {formatCurrency(store.balance)}
        </Text>{' '}
        of {store.tokenSymbol}
      </Text>
    </Button>
  );
}
