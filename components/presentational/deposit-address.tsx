import { View } from 'react-native';
import { Text } from '@/components/ui/text';

type DepositAddressProps = {
  tokenName: string;
  address: string;
  className?: string;
};

export function DepositAddress({ tokenName, address, className = '' }: DepositAddressProps) {
  return (
    <View className={className}>
      <Text variant="body" className="mb-2">
        Deposit more {tokenName} by sending to
      </Text>
      <Text variant="caption" className="mb-2 font-mono">
        {address}
      </Text>
      <Text variant="small" className="text-muted-foreground">
        Sepolia Testnet
      </Text>
    </View>
  );
}
