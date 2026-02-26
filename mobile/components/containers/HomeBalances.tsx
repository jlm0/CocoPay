import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsRestoring } from '@tanstack/react-query';
import Animated, { FadeIn } from 'react-native-reanimated';
import { HeroBalance } from '@/components/presentational/hero-balance';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokenBalances } from '@/hooks/useTokenBalances';

type HomeBalancesProps = {
  isRefreshing?: boolean;
};

function HeroBalanceSkeleton() {
  return <Skeleton className="h-14 w-48" />;
}

export function HomeBalances({ isRefreshing }: HomeBalancesProps) {
  const router = useRouter();
  const isRestoring = useIsRestoring();
  const { totalUsd, hasData, isLoading } = useTokenBalances();

  const handleBalancePress = () => {
    router.push('/(app)/balance/USDC');
  };

  const showSkeleton = isRestoring || (isLoading && !hasData) || isRefreshing;

  return (
    <View className="mb-6">
      <Text variant="caption" className="mb-1 text-muted-foreground">
        Your Balance
      </Text>
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
