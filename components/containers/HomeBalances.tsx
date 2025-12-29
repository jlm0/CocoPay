import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { HeroBalance } from '@/components/presentational/hero-balance';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useTokenBalances } from '@/hooks/useTokenBalances';

type HomeBalancesProps = {
  onCoconutPress?: () => void;
};

function HeroBalanceSkeleton() {
  return <Skeleton className="h-14 w-48 rounded" />;
}

export function HomeBalances({ onCoconutPress }: HomeBalancesProps) {
  const router = useRouter();
  const { totalUsd, isLoading } = useTokenBalances();

  const handleBalancePress = () => {
    router.push('/(app)/balance/USDC');
  };

  return (
    <View className="mb-6">
      <FeatureHeader title="Balance" onCoconutPress={onCoconutPress} className="mb-4" />
      {isLoading ? (
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
