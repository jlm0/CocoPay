import { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { parseUnits, formatUnits } from 'viem';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { HeroTokenInput } from '@/components/presentational/hero-token-input';
import { RecipientInput } from '@/components/presentational/recipient-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useViemUsdcBalance } from '@/hooks/useViemUsdcBalance';
import { useResolveAddress } from '@/hooks/useResolveAddress';
import { useErc20Withdraw } from '@/hooks/useErc20Withdraw';
import { USDC_SEPOLIA_ADDRESS, TOKEN_DECIMALS } from '@/lib/constants';
import { HEX_COLORS } from '@/lib/theme';
import { invalidateAfterWithdraw } from '@/lib/query';

export function WithdrawContainer() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const usdcBalance = useViemUsdcBalance();
  const usdcWithdraw = useErc20Withdraw(USDC_SEPOLIA_ADDRESS);

  const {
    resolvedAddress,
    isResolving,
    isValid: isValidRecipient,
    error: recipientError,
  } = useResolveAddress(recipient);

  const rawBalance = usdcBalance.data?.raw ?? 0n;
  const displayBalance = usdcBalance.data?.formatted ? parseFloat(usdcBalance.data.formatted) : 0;

  const parseAmountSafe = (value: string): bigint | null => {
    if (!value || value === '.' || value === '0.') return 0n;
    try {
      return parseUnits(value, TOKEN_DECIMALS.USDC);
    } catch {
      return null;
    }
  };

  const amountInSmallestUnit = parseAmountSafe(amount);
  const isValidInput = amountInSmallestUnit !== null;
  const amountExceedsBalance = isValidInput && amountInSmallestUnit > rawBalance;
  const amountError = !isValidInput
    ? 'Invalid amount'
    : amountExceedsBalance
      ? 'Amount exceeds balance'
      : undefined;

  const isValidAmount = isValidInput && amountInSmallestUnit > 0n && !amountExceedsBalance;
  const canWithdraw = isValidAmount && isValidRecipient && !usdcWithdraw.isLoading;

  const handleMaxPress = () => {
    setAmount(formatUnits(rawBalance, TOKEN_DECIMALS.USDC));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await usdcBalance.refetch();
    setIsRefreshing(false);
  };

  const handleWithdraw = async () => {
    if (!resolvedAddress || !canWithdraw || !amountInSmallestUnit) return;

    try {
      await usdcWithdraw.withdraw(resolvedAddress, amountInSmallestUnit);
      invalidateAfterWithdraw();
      router.push({
        pathname: '/(app)/withdraw/success',
        params: {
          amount,
          tokenSymbol: 'USDC',
          recipient: resolvedAddress,
        },
      });
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar>
          <Button
            onPress={handleWithdraw}
            disabled={!canWithdraw}
            size="lg"
            className="h-14 rounded-xl">
            <Text>{usdcWithdraw.isLoading ? 'Withdrawing...' : 'Withdraw'}</Text>
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
        <FeatureHeader title="Withdraw USDC" className="mb-6" />

        <HeroTokenInput
          value={amount}
          onChangeText={setAmount}
          tokenSymbol="USDC"
          balance={displayBalance}
          onMaxPress={handleMaxPress}
          isLoading={usdcBalance.isLoading}
          error={amountError}
          disabled={usdcWithdraw.isLoading}
        />

        <RecipientInput
          value={recipient}
          onChangeText={setRecipient}
          resolvedAddress={resolvedAddress ?? undefined}
          isResolving={isResolving}
          error={recipientError ?? undefined}
          disabled={usdcWithdraw.isLoading}
        />

        {usdcWithdraw.error && (
          <Text variant="small" className="mt-4 text-destructive">
            Transaction failed. Please try again.
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
