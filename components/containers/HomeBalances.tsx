import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { TokenBalanceCard } from '@/components/presentational/token-balance-card';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import type { TokenType } from '@/types';

type HomeBalancesProps = {
  onCoconutPress?: () => void;
};

function BalancesSkeleton() {
  return (
    <View className="flex-row justify-between gap-4">
      <View className="flex-1">
        <Skeleton className="mb-1 h-4 w-12 rounded" />
        <Skeleton className="h-9 w-24 rounded" />
      </View>
      <View className="flex-1">
        <Skeleton className="mb-1 h-4 w-10 rounded" />
        <Skeleton className="h-9 w-20 rounded" />
      </View>
    </View>
  );
}

export function HomeBalances({ onCoconutPress }: HomeBalancesProps) {
  const router = useRouter();
  const { balances, isLoading } = useTokenBalances();

  const handleBalancePress = (token: TokenType) => {
    router.push(`/(app)/balance/${token}`);
  };

  const usdcBalance = balances.find((b) => b.token === 'USDC');
  const ethBalance = balances.find((b) => b.token === 'ETH');

  const showSkeleton = isLoading;

  return (
    <View className="mb-6">
      <FeatureHeader title="Balances" onCoconutPress={onCoconutPress} className="mb-4" />
      {showSkeleton ? (
        <BalancesSkeleton />
      ) : (
        <Animated.View entering={FadeIn.duration(300)} className="flex-row justify-between gap-4">
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
        </Animated.View>
      )}
    </View>
  );
}
