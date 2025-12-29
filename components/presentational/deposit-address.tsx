import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';

type DepositAddressProps = {
  tokenName: string;
  address: string;
  copied?: boolean;
  onCopy?: () => void;
  className?: string;
};

export function DepositAddress({
  tokenName,
  address,
  copied,
  onCopy,
  className = '',
}: DepositAddressProps) {
  return (
    <View className={className}>
      <Text variant="body" className="mb-2">
        Deposit more {tokenName} by sending to
      </Text>
      <Pressable onPress={onCopy} className="active:opacity-70">
        <Text variant="caption" className="font-mono text-primary">
          {copied ? 'Copied!' : address}
        </Text>
      </Pressable>
    </View>
  );
}
