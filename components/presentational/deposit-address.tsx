import { View } from 'react-native';
import { Text } from '@/components/ui/text';

type Chain = {
  id: string;
  icon: string;
};

type DepositAddressProps = {
  tokenName: string;
  address: string;
  chains?: Chain[];
  className?: string;
};

const DEFAULT_CHAINS: Chain[] = [
  { id: 'eth', icon: '🔵' },
  { id: 'base', icon: '🔷' },
  { id: 'optimism', icon: '🔴' },
  { id: 'arbitrum', icon: '🔶' },
];

export function DepositAddress({
  tokenName,
  address,
  chains = DEFAULT_CHAINS,
  className = '',
}: DepositAddressProps) {
  return (
    <View className={className}>
      <Text variant="body" className="mb-2">
        Deposit more {tokenName} by sending to
      </Text>
      <Text variant="caption" className="mb-2 font-mono font-sans-semibold">
        {address}
      </Text>
      <View className="flex-row gap-2">
        {chains.map((chain) => (
          <Text key={chain.id} className="text-lg">
            {chain.icon}
          </Text>
        ))}
      </View>
    </View>
  );
}
