import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsRestoring } from '@tanstack/react-query';
import Animated, { FadeIn } from 'react-native-reanimated';
import { HeroBalance } from '@/components/presentational/hero-balance';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokenBalances } from '@/hooks/useTokenBalances';

type HomeBalancesProps = {
  onCoconutPress?: () => void;
  isRefreshing?: boolean;
};

function HeroBalanceSkeleton() {
  return <Skeleton className="h-14 w-48 rounded" />;
}

export function HomeBalances({ onCoconutPress, isRefreshing }: HomeBalancesProps) {
  const router = useRouter();
  const isRestoring = useIsRestoring();
  const { totalUsd, hasData, isLoading } = useTokenBalances();

  const handleBalancePress = () => {
    router.push('/(app)/balance/USDC');
  };

  const showSkeleton = isRestoring || (isLoading && !hasData) || isRefreshing;

  return (
    <View className="mb-6">
      <FeatureHeader title="Balance" onCoconutPress={onCoconutPress} className="mb-4" />
      {showSkeleton ? (
        <HeroBalanceSkeleton />
      ) : (
        <Animated.View entering={FadeIn.duration(300)}>
          <Pressable onPress={handleBalancePress} className="active:opacity-80">
            <HeroBalance value={totalUsd} />
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
