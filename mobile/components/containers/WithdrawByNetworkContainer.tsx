import { useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { parseUnits, formatUnits, type Hex } from 'viem';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { ChainOptionCard } from '@/components/presentational/chain-option-card';
import { WithdrawalQueueSection } from '@/components/presentational/withdrawal-queue-section';
import { WithdrawalQueueBar } from '@/components/presentational/withdrawal-queue-bar';
import { RecipientInput } from '@/components/presentational/recipient-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Text } from '@/components/ui/text';
import { useMultiChainUsdcBalance } from '@/hooks/useMultiChainUsdcBalance';
import { useResolveAddress } from '@/hooks/useResolveAddress';
import { useWithdrawQueue } from '@/hooks/useWithdrawQueue';
import { useMultiChainWithdraw } from '@/hooks/useMultiChainWithdraw';
import { TOKEN_DECIMALS, type SupportedChainId } from '@/lib/constants';
import { HEX_COLORS } from '@/lib/theme';
import { invalidateAfterWithdraw } from '@/lib/query';

const FEE_BUFFER = parseUnits('0.01', TOKEN_DECIMALS.USDC);

export function WithdrawByNetworkContainer() {
  const router = useRouter();
  const { recipient: routeRecipient } = useLocalSearchParams<{ recipient?: string }>();

  const [expandedChainId, setExpandedChainId] = useState<SupportedChainId | null>(null);
  const [chainInputs, setChainInputs] = useState<Record<number, string>>({});
  const [recipient, setRecipient] = useState(routeRecipient ?? '');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    balances,
    isLoading: balancesLoading,
    refetch: refetchBalances,
  } = useMultiChainUsdcBalance();

  const withdrawQueue = useWithdrawQueue();
  const multiChainWithdraw = useMultiChainWithdraw();

  const {
    resolvedAddress,
    isResolving,
    isValid: isValidRecipient,
    error: recipientError,
  } = useResolveAddress(recipient);

  const chainsWithBalance = balances.filter((b) => b.balance > 0n);
  const canWithdraw =
    withdrawQueue.queue.length > 0 && isValidRecipient && !multiChainWithdraw.isLoading;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchBalances();
    setIsRefreshing(false);
  };

  const handleChainPress = (chainId: SupportedChainId) => {
    setExpandedChainId((prev) => (prev === chainId ? null : chainId));
  };

  const handleInputChange = (chainId: SupportedChainId, value: string) => {
    setChainInputs((prev) => ({ ...prev, [chainId]: value }));
  };

  const handleMaxPress = (chainId: SupportedChainId, balance: bigint) => {
    const maxAmount = balance > FEE_BUFFER ? balance - FEE_BUFFER : balance;
    setChainInputs((prev) => ({
      ...prev,
      [chainId]: formatUnits(maxAmount, TOKEN_DECIMALS.USDC),
    }));
  };

  const handleAddPress = (chainId: SupportedChainId) => {
    const inputValue = chainInputs[chainId];
    if (!inputValue || inputValue === '0') return;

    try {
      const amountBigint = parseUnits(inputValue, TOKEN_DECIMALS.USDC);
      withdrawQueue.addToQueue(chainId, amountBigint);
      setChainInputs((prev) => ({ ...prev, [chainId]: '' }));
      setExpandedChainId(null);
    } catch {
      // Invalid amount
    }
  };

  const handleRemoveFromQueue = (chainId: SupportedChainId) => {
    withdrawQueue.removeFromQueue(chainId);
  };

  const handleWithdraw = async () => {
    if (!resolvedAddress || !canWithdraw) return;

    try {
      const results = await multiChainWithdraw.withdraw(
        withdrawQueue.queue,
        resolvedAddress as Hex
      );
      const successCount = results.filter((r) => r.success).length;
      const totalAmount = withdrawQueue.totalFormatted;

      invalidateAfterWithdraw();
      withdrawQueue.clearQueue();

      router.push({
        pathname: '/(app)/withdraw/success',
        params: {
          amount: totalAmount,
          tokenSymbol: 'USDC',
          recipient: resolvedAddress,
          withdrawalCount: String(successCount),
        },
      });
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar disabled={multiChainWithdraw.isLoading}>
          <WithdrawalQueueBar
            queueCount={withdrawQueue.queue.length}
            totalFormatted={withdrawQueue.totalFormatted}
            onWithdraw={handleWithdraw}
            isLoading={multiChainWithdraw.isLoading}
            disabled={!canWithdraw}
          />
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
            enabled={!multiChainWithdraw.isLoading}
          />
        }>
        <FeatureHeader title="Withdraw by Network" className="mb-6" />

        <Text variant="label" className="mb-3">
          Select a Network
        </Text>

        <View className="gap-2">
          {chainsWithBalance.map((chainBalance) => {
            const isQueued = withdrawQueue.isInQueue(chainBalance.chainId);

            return (
              <ChainOptionCard
                key={chainBalance.chainId}
                chainId={chainBalance.chainId}
                balance={chainBalance.balance}
                formatted={chainBalance.formatted}
                isExpanded={expandedChainId === chainBalance.chainId && !isQueued}
                onPress={() => !isQueued && handleChainPress(chainBalance.chainId)}
                inputValue={chainInputs[chainBalance.chainId] ?? ''}
                onInputChange={(value) => handleInputChange(chainBalance.chainId, value)}
                onMaxPress={() => handleMaxPress(chainBalance.chainId, chainBalance.balance)}
                onAddPress={() => handleAddPress(chainBalance.chainId)}
                disabled={multiChainWithdraw.isLoading || isQueued}
              />
            );
          })}
        </View>

        {chainsWithBalance.length === 0 && !balancesLoading && (
          <Text variant="caption" className="text-center">
            No chains with balance available
          </Text>
        )}

        <WithdrawalQueueSection
          queue={withdrawQueue.queue}
          onRemoveItem={handleRemoveFromQueue}
          disabled={multiChainWithdraw.isLoading}
          className="mt-6"
        />

        <View className="mt-6">
          <RecipientInput
            value={recipient}
            onChangeText={setRecipient}
            resolvedAddress={resolvedAddress ?? undefined}
            isResolving={isResolving}
            error={recipientError ?? undefined}
            disabled={multiChainWithdraw.isLoading}
          />
        </View>

        {multiChainWithdraw.progress.status === 'failed' && (
          <Text variant="small" className="mt-4 text-center text-destructive">
            Withdrawals failed. Please try again.
          </Text>
        )}

        {multiChainWithdraw.progress.status === 'partial' && (
          <Text variant="small" className="mt-4 text-center text-info">
            Some withdrawals failed. Check your transaction history.
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
