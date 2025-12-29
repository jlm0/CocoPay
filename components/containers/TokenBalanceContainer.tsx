import { useState, useCallback, useRef } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsRestoring } from '@tanstack/react-query';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { HeroBalance } from '@/components/presentational/hero-balance';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { ReceiveBottomSheet } from '@/components/containers/ReceiveBottomSheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import type { BottomSheetMethods } from '@/components/ui/bottom-sheet';
import { useUnifiedUsdBalance } from '@/hooks/useUnifiedUsdBalance';
import { HEX_COLORS } from '@/lib/theme';

export function TokenBalanceContainer() {
  const router = useRouter();
  const isRestoring = useIsRestoring();
  const receiveSheetRef = useRef<BottomSheetMethods>(null);

  const { totalReclaimable, totalUsd, usdcByChain, hasData, isLoading, error, refetch } =
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
            <Button
              variant="secondary"
              onPress={handleReceive}
              size="lg"
              className="h-14 rounded-xl">
              <Text>Receive</Text>
            </Button>

            <Button onPress={handleWithdraw} size="lg" className="h-14 rounded-xl">
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
              Your Balance
            </Text>
            <HeroBalance value={totalUsd} />
          </View>

          <View className="rounded-lg border border-border bg-card p-4">
            <Text variant="small" className="mb-3 text-muted-foreground">
              Balance by Network
            </Text>
            {usdcByChain.map((chain) => (
              <View key={chain.chainId} className="flex-row justify-between py-2">
                <Text variant="body">{chain.chainName}</Text>
                <Text variant="body">${parseFloat(chain.formatted).toFixed(2)}</Text>
              </View>
            ))}
            <Separator className="my-2" />
            <View className="flex-row justify-between py-2">
              <Text variant="body" className="text-muted-foreground">
                Store Rewards
              </Text>
              <Text
                variant="body"
                className={totalReclaimable > 0 ? 'text-primary' : 'text-foreground'}>
                {totalReclaimable > 0 ? '+' : ''}${totalReclaimable.toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>

      <ReceiveBottomSheet ref={receiveSheetRef} />
    </>
  );
}
