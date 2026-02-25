import { View } from 'react-native';
import { CircleCheck } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type CashOutSuccessProps = {
  tokenAmount: string;
  tokenSymbol: string;
  usdcAmount: string;
  storeName: string;
  className?: string;
};

export function CashOutSuccess({
  tokenAmount,
  tokenSymbol,
  usdcAmount,
  storeName,
  className = '',
}: CashOutSuccessProps) {
  return (
    <View className={cn('flex-1 items-center justify-center px-6', className)}>
      <Icon as={CircleCheck} size={80} className="mb-6 text-primary" />

      <Text variant="title" className="mb-2 text-center">
        Cash Out Successful
      </Text>

      <Text className="mb-8 text-center font-sans-bold text-5xl">${usdcAmount}</Text>

      <Text variant="caption" className="text-center">
        USDC received
      </Text>

      <View className="mt-8 w-full rounded-xl bg-muted/50 p-4">
        <Text className="text-center text-sm text-muted-foreground">
          You cashed out{' '}
          <Text className="font-sans-semibold text-foreground">
            {tokenAmount} {tokenSymbol}
          </Text>{' '}
          from {storeName}
        </Text>
      </View>
    </View>
  );
}
