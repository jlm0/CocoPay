import { useState, useCallback, useEffect } from 'react';
import { ScrollView, RefreshControl, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { BalanceDisplay } from '@/components/presentational/balance-display';
import { DepositAddress } from '@/components/presentational/deposit-address';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useUnifiedUsdBalance } from '@/hooks/useUnifiedUsdBalance';
import { useParaAccount } from '@/hooks/useParaAccount';
import { HEX_COLORS } from '@/lib/theme';

export function TokenBalanceContainer() {
  const router = useRouter();
  const { address } = useParaAccount();

  const { totalUsdc, totalReclaimable, totalUsd, usdcByChain, isLoading, error, refetch } =
    useUnifiedUsdBalance();

  const amount = totalUsdc;
  const usdValue = totalUsd;

  const hasError = !!error;

  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleCopyAddress = async () => {
    if (address) {
      await Clipboard.setStringAsync(address);
      setCopied(true);
    }
  };

  const handleWithdraw = () => {
    router.push('/(app)/withdraw');
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (isLoading && usdcByChain.length === 0) {
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

  if (hasError) {
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
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar>
          <Button
            variant={copied ? 'success' : 'secondary'}
            onPress={handleCopyAddress}
            size="lg"
            className="h-14 rounded-xl">
            <Text>{copied ? 'Copied!' : 'Copy deposit address'}</Text>
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
        <FeatureHeader title="USDC" className="mb-8" />

        <Pressable
          onPress={handleToggleExpand}
          className="mb-4 flex-row items-center justify-between active:opacity-80">
          <BalanceDisplay amount={amount} tokenSymbol="USDC" usdValue={usdValue} />
          <Icon
            as={isExpanded ? ChevronUp : ChevronDown}
            size={24}
            className="text-muted-foreground"
          />
        </Pressable>

        {isExpanded && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            className="mb-8 rounded-lg border border-border bg-card p-4">
            <Text variant="small" className="mb-3 text-muted-foreground">
              Balance by Chain
            </Text>
            {usdcByChain.map((chain) => (
              <View key={chain.chainId} className="flex-row justify-between py-2">
                <Text variant="body">{chain.chainName}</Text>
                <Text variant="body">${parseFloat(chain.formatted).toFixed(2)}</Text>
              </View>
            ))}
            {totalReclaimable > 0 && (
              <>
                <Separator className="my-2" />
                <View className="flex-row justify-between py-2">
                  <Text variant="body" className="text-muted-foreground">
                    Reclaimable
                  </Text>
                  <Text variant="body" className="text-primary">
                    +${totalReclaimable.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </Animated.View>
        )}

        {!isExpanded && <View className="mb-4" />}

        <DepositAddress tokenName="USDC" address={address ?? ''} />
      </ScrollView>
    </ScreenContainer>
  );
}
