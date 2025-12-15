import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type ChargeStoreInfoProps = {
  storeName: string;
  storeCode: string;
  className?: string;
};

export function ChargeStoreInfo({ storeName, storeCode, className = '' }: ChargeStoreInfoProps) {
  return (
    <View className={cn('items-center gap-1', className)}>
      <Text variant="title">{storeName}</Text>
      <Text variant="caption">{storeCode}</Text>
    </View>
  );
}
