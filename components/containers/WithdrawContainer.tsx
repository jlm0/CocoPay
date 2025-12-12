import { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { parseEther } from 'viem';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { TokenAmountInput } from '@/components/presentational/token-amount-input';
import { RecipientInput } from '@/components/presentational/recipient-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useViemEthBalance } from '@/hooks/useViemEthBalance';
import { useResolveAddress } from '@/hooks/useResolveAddress';
import { useEthWithdraw } from '@/hooks/useEthWithdraw';
import { ETH_GAS_BUFFER } from '@/lib/constants';
import { HEX_COLORS } from '@/lib/theme';

export function WithdrawContainer() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const balance = useViemEthBalance();
  const {
    resolvedAddress,
    isResolving,
    isValid: isValidRecipient,
    error: recipientError,
  } = useResolveAddress(recipient);
  const { withdraw, isLoading: isWithdrawing, error: withdrawError } = useEthWithdraw();

  const ethBalance = balance.data?.formatted ? parseFloat(balance.data.formatted) : 0;
  const numericAmount = parseFloat(amount) || 0;

  const amountExceedsBalance = numericAmount > ethBalance;
  const amountError = amountExceedsBalance ? 'Amount exceeds balance' : undefined;

  const isValidAmount = numericAmount > 0 && !amountExceedsBalance;
  const canWithdraw = isValidAmount && isValidRecipient && !isWithdrawing;

  const handleMaxPress = () => {
    const maxWithdrawable = Math.max(0, ethBalance - ETH_GAS_BUFFER);
    setAmount(maxWithdrawable.toString());
  };

  const handleWithdraw = async () => {
    if (!resolvedAddress || !canWithdraw) return;

    try {
      const valueInWei = parseEther(amount);
      await withdraw(resolvedAddress, valueInWei);
      await balance.refetch();
      router.back();
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
            <Text>{isWithdrawing ? 'Withdrawing...' : 'Withdraw'}</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-64"
        refreshControl={
          <RefreshControl
            refreshing={balance.isFetching}
            onRefresh={() => balance.refetch()}
            tintColor={HEX_COLORS.primary}
            colors={[HEX_COLORS.primary]}
          />
        }>
        <FeatureHeader title="Withdraw ETH" className="mb-8" />

        <TokenAmountInput
          value={amount}
          onChangeText={setAmount}
          tokenSymbol="ETH"
          balance={ethBalance}
          showTokenInBalance
          onMaxPress={handleMaxPress}
          error={amountError}
          className="mb-6"
        />

        <RecipientInput
          value={recipient}
          onChangeText={setRecipient}
          resolvedAddress={resolvedAddress ?? undefined}
          isResolving={isResolving}
          error={recipientError ?? undefined}
        />

        {withdrawError && (
          <Text variant="small" className="mt-4 text-destructive">
            Transaction failed. Please try again.
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
