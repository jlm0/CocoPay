import { useState, useCallback, useRef, useEffect } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsRestoring } from '@tanstack/react-query';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { HeroBalance } from '@/components/presentational/hero-balance';
import { BalanceRewardsSection } from '@/components/presentational/balance-rewards-section';
import { BalanceWalletSection } from '@/components/presentational/balance-wallet-section';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { ReceiveBottomSheet } from '@/components/containers/ReceiveBottomSheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import type { BottomSheetMethods } from '@/components/ui/bottom-sheet';
import { useUnifiedUsdBalance } from '@/hooks/useUnifiedUsdBalance';
import { HEX_COLORS } from '@/lib/theme';

export function TokenBalanceContainer() {
  const router = useRouter();
  const isRestoring = useIsRestoring();
  const receiveSheetRef = useRef<BottomSheetMethods>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  const { totalUsdc, totalReclaimable, totalUsd, usdcByChain, hasData, isLoading, error, refetch } =
    useUnifiedUsdBalance();

  const showSkeleton = isRestoring || (isLoading && !hasData);
  const showError = !hasData && !!error;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleReceive = useCallback(() => {
    receiveSheetRef.current?.expand();
  }, []);

  const handleWithdraw = () => {
    router.push('/(app)/withdraw');
  };

  if (showSkeleton) {
    return (
      <ScreenContainer>
        <View className="p-4">
          <Skeleton className="mb-8 h-8 w-24" />
          <Skeleton className="mb-2 h-4 w-16" />
          <Skeleton className="mb-2 h-12 w-40" />
          <Skeleton className="mb-8 h-6 w-32" />
          <Skeleton className="h-20 w-full" />
        </View>
      </ScreenContainer>
    );
  }

  if (showError) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center gap-4 p-4">
          <Text variant="body" className="text-center text-destructive">
            Failed to load balance
          </Text>
          <Button onPress={handleRefresh} variant="secondary">
            <Text>Try again</Text>
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <>
      <ScreenContainer
        bottomActionBar={
          <BottomActionBar>
            <Button variant="secondary" onPress={handleReceive} size="lg" className="h-14">
              <Text>Receive</Text>
            </Button>

            <Button onPress={handleWithdraw} size="lg" className="h-14">
              <Text>Withdraw</Text>
            </Button>
          </BottomActionBar>
        }>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-64"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={HEX_COLORS.primary}
              colors={[HEX_COLORS.primary]}
            />
          }>
          <FeatureHeader title="Balance" className="mb-8" />

          <View className="mb-6">
            <Text variant="caption" className="mb-1">
              Total Balance
            </Text>
            <HeroBalance value={totalUsd} animated={hasMountedRef.current} />
          </View>

          <BalanceRewardsSection totalRewards={totalReclaimable} className="mb-4" />

          <BalanceWalletSection totalWallet={totalUsdc} chainBalances={usdcByChain} />
        </ScrollView>
      </ScreenContainer>

      <ReceiveBottomSheet ref={receiveSheetRef} />
    </>
  );
}
