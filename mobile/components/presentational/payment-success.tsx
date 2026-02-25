import { View } from 'react-native';
import { CircleCheck } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type PaymentSuccessProps = {
  amount: string;
  storeName: string;
  tokenSymbol: string;
  cashBack: string;
  className?: string;
};

function formatCashBack(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

export function PaymentSuccess({
  amount,
  storeName,
  tokenSymbol,
  cashBack,
  className = '',
}: PaymentSuccessProps) {
  return (
    <View className={cn('flex-1 items-center justify-center px-6', className)}>
      <Icon as={CircleCheck} size={80} className="mb-6 text-primary" />

      <Text variant="title" className="mb-2 text-center">
        Payment Successful
      </Text>

      <Text className="mb-8 text-center font-sans-bold text-5xl">${amount}</Text>

      <Text variant="caption" className="text-center">
        Paid to {storeName}
      </Text>

      <View className="mt-8 w-full rounded-xl bg-muted/50 p-4">
        <Text className="text-center text-sm text-muted-foreground">
          You received{' '}
          <Text className="font-sans-semibold text-foreground">
            {formatCashBack(cashBack)} {tokenSymbol}
          </Text>{' '}
          cash back
        </Text>
      </View>
    </View>
  );
}
