import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { TokenBalanceCard } from '@/components/presentational/token-balance-card';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import type { TokenType } from '@/types';

export function HomeBalances() {
  const router = useRouter();
  const { balances } = useTokenBalances();

  const handleBalancePress = (token: TokenType) => {
    router.push(`/(app)/balance/${token}`);
  };

  const usdcBalance = balances.find((b) => b.token === 'USDC');
  const ethBalance = balances.find((b) => b.token === 'ETH');

  return (
    <View className="mb-6">
      <FeatureHeader title="Balances" className="mb-4" />
      <View className="flex-row justify-between gap-4">
        {usdcBalance && (
          <TokenBalanceCard
            token={usdcBalance.token}
            usdValue={usdcBalance.usdValue}
            onPress={() => handleBalancePress(usdcBalance.token)}
            className="flex-1"
          />
        )}
        {ethBalance && (
          <TokenBalanceCard
            token={ethBalance.token}
            usdValue={ethBalance.usdValue}
            onPress={() => handleBalancePress(ethBalance.token)}
            className="flex-1"
          />
        )}
      </View>
    </View>
  );
}
