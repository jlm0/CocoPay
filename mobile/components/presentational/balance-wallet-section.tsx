import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Wallet, ChevronRight, ChevronDown } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { ChainBalance } from '@/hooks/useMultiChainUsdcBalance';

type BalanceWalletSectionProps = {
  totalWallet: number;
  chainBalances: ChainBalance[];
  className?: string;
};

export function BalanceWalletSection({
  totalWallet,
  chainBalances,
  className,
}: BalanceWalletSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className={cn('rounded-lg border border-border bg-card p-4', className)}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon as={Wallet} size={16} className="text-muted-foreground" />
          <Text variant="small" className="text-muted-foreground">
            Wallet
          </Text>
        </View>
        <Text variant="body-emphasis">${totalWallet.toFixed(2)} USDC</Text>
      </View>

      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        className="mt-4 flex-row items-center active:opacity-70">
        <Text className="font-mono text-sm text-primary">
          {isExpanded ? 'Hide network breakdown' : 'View network breakdown'}
        </Text>
        <Icon
          as={isExpanded ? ChevronDown : ChevronRight}
          size={16}
          className="ml-1 text-primary"
        />
      </Pressable>

      {isExpanded && (
        <View className="mt-3 rounded-md bg-muted/50 p-3">
          {chainBalances.map((chain) => (
            <View key={chain.chainId} className="flex-row justify-between py-1.5">
              <Text variant="body" className="text-muted-foreground">
                {chain.chainName}
              </Text>
              <Text variant="body">${parseFloat(chain.formatted).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
