import { useState, useMemo, useRef, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { parseUnits, formatUnits } from 'viem';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { ChainSelectorSheet } from '@/components/presentational/chain-selector-sheet';
import { WithdrawBalanceInfo } from '@/components/presentational/withdraw-balance-info';
import { RecipientInput } from '@/components/presentational/recipient-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { BottomSheetMethods } from '@/components/ui/bottom-sheet';
import { useMultiChainUsdcBalance } from '@/hooks/useMultiChainUsdcBalance';
import { useResolveAddress } from '@/hooks/useResolveAddress';
import { useErc20Withdraw } from '@/hooks/useErc20Withdraw';
import { getUsdcAddress, TOKEN_DECIMALS, type SupportedChainId } from '@/lib/constants';
import { CHAIN_BY_ID } from '@/lib/chains';
import { HEX_COLORS } from '@/lib/theme';
import { invalidateAfterWithdraw } from '@/lib/query';
import { cn } from '@/lib/utils';

const FEE_BUFFER = parseUnits('0.01', TOKEN_DECIMALS.USDC);

export function WithdrawContainer() {
  const router = useRouter();
  const chainSheetRef = useRef<BottomSheetMethods>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<SupportedChainId | null>(null);

  const {
    balances,
    totalBalance,
    isLoading: balancesLoading,
    refetch: refetchBalances,
  } = useMultiChainUsdcBalance();

  const chainsWithBalance = balances.filter((b) => b.balance > 0n);

  useEffect(() => {
    if (!selectedChainId && chainsWithBalance.length > 0) {
      const best = chainsWithBalance.reduce((a, b) => (a.balance > b.balance ? a : b));
      setSelectedChainId(best.chainId);
    }
  }, [chainsWithBalance, selectedChainId]);

  const selectedChain = selectedChainId ? CHAIN_BY_ID[selectedChainId] : null;
  const selectedBalance = selectedChainId
    ? (balances.find((b) => b.chainId === selectedChainId)?.balance ?? 0n)
    : 0n;
  const selectedBalanceFormatted = formatUnits(selectedBalance, TOKEN_DECIMALS.USDC);

  const usdcAddress = selectedChainId ? getUsdcAddress(selectedChainId) : null;
  const usdcWithdraw = useErc20Withdraw(usdcAddress ?? '0x', selectedChain ?? CHAIN_BY_ID[1]);

  const {
    resolvedAddress,
    isResolving,
    isValid: isValidRecipient,
    error: recipientError,
  } = useResolveAddress(recipient);

  const amountInSmallestUnit = useMemo(() => {
    if (!amount || amount === '.' || amount === '0.') return 0n;
    try {
      return parseUnits(amount, TOKEN_DECIMALS.USDC);
    } catch {
      return 0n;
    }
  }, [amount]);

  const amountExceedsBalance = amountInSmallestUnit > selectedBalance;
  const amountExceedsTotalBalance = amountInSmallestUnit > totalBalance;
  const amountError = amountExceedsBalance
    ? amountExceedsTotalBalance
      ? 'Amount exceeds total balance'
      : 'Amount exceeds balance on this network'
    : undefined;

  const isValidAmount = amountInSmallestUnit > 0n && !amountExceedsBalance;
  const canWithdraw =
    isValidAmount && isValidRecipient && !usdcWithdraw.isLoading && selectedChainId !== null;

  const hasValue = amount.length > 0 && amount !== '0';

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

  const handleAmountChange = (text: string) => {
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : filtered;
    setAmount(sanitized);
  };

  const handleMaxPress = () => {
    const maxAmount = selectedBalance > FEE_BUFFER ? selectedBalance - FEE_BUFFER : selectedBalance;
    setAmount(formatUnits(maxAmount, TOKEN_DECIMALS.USDC));
  };

  const handleChainPress = () => {
    if (chainsWithBalance.length > 1) {
      chainSheetRef.current?.expand();
    }
  };

  const handleChainSelect = (chainId: SupportedChainId) => {
    setSelectedChainId(chainId);
    chainSheetRef.current?.close();
    setAmount('');
  };

  const handleAdvancedPress = () => {
    router.push({
      pathname: '/(app)/withdraw/by-network',
      params: { recipient },
    });
  };

  return (
    <>
      <ScreenContainer
        bottomActionBar={
          <BottomActionBar disabled={usdcWithdraw.isLoading}>
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
              enabled={!usdcWithdraw.isLoading}
            />
          }>
          <FeatureHeader title="Withdraw USDC" className="mb-6" />

          {/* === HERO ZONE: $ + Input + Max === */}
          <View className="items-center pb-3 pt-6">
            {/* Input row with $ prefix and Max button */}
            <View className="flex-row items-center justify-center gap-2">
              <Text className="font-sans-bold text-5xl text-muted-foreground/50">$</Text>
              <Input
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                placeholder="0"
                textAlignVertical="center"
                editable={!usdcWithdraw.isLoading}
                className={cn(
                  'h-16 min-w-16 border-0 bg-transparent px-0 py-0 text-center font-sans-bold text-5xl leading-tight shadow-none',
                  !hasValue && 'text-muted-foreground/30'
                )}
                style={{ width: Math.max(64, amount.length * 28 + 16) }}
              />

              <Pressable
                onPress={handleMaxPress}
                disabled={usdcWithdraw.isLoading}
                className="rounded-lg bg-secondary px-3 py-2 active:bg-secondary/70">
                <Text variant="caption" className="font-sans-semibold text-secondary-foreground">
                  Max
                </Text>
              </Pressable>
            </View>

            {/* Error message */}
            {amountError && (
              <Text variant="small" className="mt-3 text-destructive">
                {amountError}
              </Text>
            )}
          </View>

          {/* === CONTEXT ZONE: Balance + Chain (space-between) === */}
          <WithdrawBalanceInfo
            balance={selectedBalanceFormatted}
            chainId={selectedChainId ?? undefined}
            onChainPress={handleChainPress}
            isLoading={balancesLoading}
            disabled={usdcWithdraw.isLoading}
            canChangeChain={chainsWithBalance.length > 1}
            className="mb-8"
          />

          {/* === DESTINATION ZONE: Recipient === */}
          <RecipientInput
            value={recipient}
            onChangeText={setRecipient}
            resolvedAddress={resolvedAddress ?? undefined}
            isResolving={isResolving}
            error={recipientError ?? undefined}
            disabled={usdcWithdraw.isLoading}
          />

          {/* === ADVANCED OPTION: Split across networks === */}
          {chainsWithBalance.length > 1 && (
            <Pressable
              onPress={handleAdvancedPress}
              disabled={usdcWithdraw.isLoading}
              className={cn(
                'mt-6 self-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 active:bg-amber-100',
                usdcWithdraw.isLoading && 'opacity-50'
              )}>
              <Text variant="caption" className="font-sans-medium text-amber-800">
                Or split across networks
              </Text>
            </Pressable>
          )}

          {/* Error state */}
          {usdcWithdraw.error && (
            <Text variant="small" className="mt-4 text-center text-destructive">
              Transaction failed. Please try again.
            </Text>
          )}
        </ScrollView>
      </ScreenContainer>

      <ChainSelectorSheet
        ref={chainSheetRef}
        selectedChainId={selectedChainId ?? (1 as SupportedChainId)}
        balances={balances}
        onSelect={handleChainSelect}
      />
    </>
  );
}
