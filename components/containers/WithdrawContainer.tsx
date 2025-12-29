import { useState, useMemo } from 'react';
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
import { useMultiChainUsdcBalance } from '@/hooks/useMultiChainUsdcBalance';
import { useChainForPayment } from '@/hooks/useChainForPayment';
import { useResolveAddress } from '@/hooks/useResolveAddress';
import { useErc20Withdraw } from '@/hooks/useErc20Withdraw';
import { getUsdcAddress, TOKEN_DECIMALS } from '@/lib/constants';
import { CHAIN_BY_ID } from '@/lib/chains';
import { HEX_COLORS } from '@/lib/theme';
import { invalidateAfterWithdraw } from '@/lib/query';

export function WithdrawContainer() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    totalBalance,
    totalFormatted,
    isLoading: balancesLoading,
    refetch: refetchBalances,
  } = useMultiChainUsdcBalance();

  const amountInSmallestUnit = useMemo(() => {
    if (!amount || amount === '.' || amount === '0.') return 0n;
    try {
      return parseUnits(amount, TOKEN_DECIMALS.USDC);
    } catch {
      return 0n;
    }
  }, [amount]);

  const { chainId: selectedChainId } = useChainForPayment(amountInSmallestUnit);

  const selectedChain = CHAIN_BY_ID[selectedChainId];
  const usdcAddress = getUsdcAddress(selectedChainId);
  const usdcWithdraw = useErc20Withdraw(usdcAddress, selectedChain);

  const {
    resolvedAddress,
    isResolving,
    isValid: isValidRecipient,
    error: recipientError,
  } = useResolveAddress(recipient);

  const displayBalance = parseFloat(totalFormatted) || 0;

  const amountExceedsBalance = amountInSmallestUnit > totalBalance;
  const amountError = amountExceedsBalance ? 'Amount exceeds balance' : undefined;

  const isValidAmount = amountInSmallestUnit > 0n && !amountExceedsBalance;
  const canWithdraw = isValidAmount && isValidRecipient && !usdcWithdraw.isLoading;

  const handleMaxPress = () => {
    setAmount(formatUnits(totalBalance, TOKEN_DECIMALS.USDC));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchBalances();
    setIsRefreshing(false);
  };

  const handleWithdraw = async () => {
    if (!resolvedAddress || !canWithdraw || amountInSmallestUnit === 0n) return;

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
          isLoading={balancesLoading}
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
