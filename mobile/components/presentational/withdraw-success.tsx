import { View } from 'react-native';
import { CircleCheck } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { truncateAddress } from '@/lib/format';

type WithdrawSuccessProps = {
  amount: string;
  tokenSymbol: string;
  recipient: string;
  className?: string;
};

export function WithdrawSuccess({
  amount,
  tokenSymbol,
  recipient,
  className = '',
}: WithdrawSuccessProps) {
  return (
    <View className={cn('flex-1 items-center justify-center px-6', className)}>
      <Icon as={CircleCheck} size={80} className="mb-6 text-primary" />

      <Text variant="title" className="mb-2 text-center">
        Withdrawal Successful
      </Text>

      <Text className="mb-8 text-center font-sans-bold text-5xl">
        {amount} {tokenSymbol}
      </Text>

      <Text variant="caption" className="text-center">
        Sent to {truncateAddress(recipient)}
      </Text>
    </View>
  );
}
