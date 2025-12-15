import { View } from 'react-native';
import { CircleCheck } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type PaymentSuccessProps = {
  amount: string;
  storeName: string;
  tokensReceived: string;
  className?: string;
};

function formatTokens(tokens: string): string {
  const num = parseFloat(tokens);
  if (isNaN(num)) return '0';
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

export function PaymentSuccess({
  amount,
  storeName,
  tokensReceived,
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
        <View className="flex-row items-center justify-between">
          <Text variant="caption">Tokens Received</Text>
          <Text className="font-sans-semibold">{formatTokens(tokensReceived)}</Text>
        </View>
      </View>
    </View>
  );
}
