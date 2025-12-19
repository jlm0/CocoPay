import { useState, useCallback, useEffect } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { BalanceDisplay } from '@/components/presentational/balance-display';
import { DepositAddress } from '@/components/presentational/deposit-address';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useViemUsdcBalance } from '@/hooks/useViemUsdcBalance';
import { useParaAccount } from '@/hooks/useParaAccount';
import { HEX_COLORS } from '@/lib/theme';

export function TokenBalanceContainer() {
  const router = useRouter();
  const { address } = useParaAccount();

  const usdcBalance = useViemUsdcBalance();

  const amount = usdcBalance.data?.formatted ? parseFloat(usdcBalance.data.formatted) : 0;
  const usdValue = amount;

  const isLoading = usdcBalance.isLoading && !usdcBalance.data;
  const hasError = !!usdcBalance.error;

  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await usdcBalance.refetch();
    setIsRefreshing(false);
  }, [usdcBalance]);

  const handleCopyAddress = async () => {
    if (address) {
      await Clipboard.setStringAsync(address);
      setCopied(true);
    }
  };

  const handleWithdraw = () => {
    router.push('/(app)/withdraw');
  };

  if (isLoading) {
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

        <BalanceDisplay amount={amount} tokenSymbol="USDC" usdValue={usdValue} className="mb-8" />

        <DepositAddress tokenName="USDC" address={address ?? ''} />
      </ScrollView>
    </ScreenContainer>
  );
}
