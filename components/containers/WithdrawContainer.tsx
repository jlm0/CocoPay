import { useState, useMemo } from 'react';
import { ScrollView, RefreshControl, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { parseUnits, formatUnits } from 'viem';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { HeroTokenInput } from '@/components/presentational/hero-token-input';
import { RecipientInput } from '@/components/presentational/recipient-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useMultiChainUsdcBalance, type ChainBalance } from '@/hooks/useMultiChainUsdcBalance';
import { useResolveAddress } from '@/hooks/useResolveAddress';
import { useErc20Withdraw } from '@/hooks/useErc20Withdraw';
import { getUsdcAddress, TOKEN_DECIMALS, type SupportedChainId } from '@/lib/constants';
import { CHAIN_BY_ID } from '@/lib/chains';
import { HEX_COLORS } from '@/lib/theme';
import { invalidateAfterWithdraw } from '@/lib/query';
import { cn } from '@/lib/utils';

function ChainSelector({
  balances,
  selectedChainId,
  onSelect,
}: {
  balances: ChainBalance[];
  selectedChainId: SupportedChainId;
  onSelect: (chainId: SupportedChainId) => void;
}) {
  return (
    <View className="mb-6">
      <Text variant="small" className="mb-2 text-muted-foreground">
        Select chain to withdraw from
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {balances.map((balance) => {
          const isSelected = balance.chainId === selectedChainId;
          const hasBalance = balance.balance > 0n;

          return (
            <Pressable
              key={balance.chainId}
              onPress={() => onSelect(balance.chainId)}
              disabled={!hasBalance}
              className={cn(
                'rounded-lg border px-3 py-2',
                isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card',
                !hasBalance && 'opacity-50'
              )}>
              <Text
                variant="small"
                className={cn('font-sans-medium', isSelected ? 'text-primary' : 'text-foreground')}>
                {balance.chainName}
              </Text>
              <Text variant="small" className="text-muted-foreground">
                {parseFloat(balance.formatted).toFixed(2)} USDC
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function WithdrawContainer() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<SupportedChainId>(11155111);

  const {
    balances,
    isLoading: balancesLoading,
    refetch: refetchBalances,
  } = useMultiChainUsdcBalance();

  const selectedBalance = useMemo(() => {
    return balances.find((b) => b.chainId === selectedChainId);
  }, [balances, selectedChainId]);

  const selectedChain = CHAIN_BY_ID[selectedChainId];
  const usdcAddress = getUsdcAddress(selectedChainId);
  const usdcWithdraw = useErc20Withdraw(usdcAddress, selectedChain);

  const {
    resolvedAddress,
    isResolving,
    isValid: isValidRecipient,
    error: recipientError,
  } = useResolveAddress(recipient);

  const rawBalance = selectedBalance?.balance ?? 0n;
  const displayBalance = selectedBalance?.formatted ? parseFloat(selectedBalance.formatted) : 0;

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
    await refetchBalances();
    setIsRefreshing(false);
  };

  const handleChainSelect = (chainId: SupportedChainId) => {
    setSelectedChainId(chainId);
    setAmount('');
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
          chainName: selectedBalance?.chainName ?? 'Unknown',
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

        <ChainSelector
          balances={balances}
          selectedChainId={selectedChainId}
          onSelect={handleChainSelect}
        />

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
