import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type QRCodeDisplayProps = {
  value: string;
  size?: number;
  storeName: string;
  storeCode: string;
  amount: string;
  className?: string;
};

export function QRCodeDisplay({
  value,
  size = 250,
  storeName,
  storeCode,
  amount,
  className = '',
}: QRCodeDisplayProps) {
  return (
    <View className={cn('items-center', className)}>
      <View className="mb-6 items-center gap-1">
        <Text variant="title">{storeName}</Text>
        <Text variant="caption">{storeCode}</Text>
      </View>

      <View className="mb-6 rounded-2xl bg-white p-4">
        <QRCode value={value} size={size} backgroundColor="white" color="black" />
      </View>

      <Text className="mb-2 text-center font-ops text-5xl">${amount}</Text>

      <Text variant="caption" className="text-center">
        Scan to pay with CocoPay
      </Text>
    </View>
  );
}
