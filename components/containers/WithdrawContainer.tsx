import { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { HeroTokenInput } from '@/components/presentational/hero-token-input';
import { RecipientInput } from '@/components/presentational/recipient-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useViemEthBalance } from '@/hooks/useViemEthBalance';
import { useViemUsdcBalance } from '@/hooks/useViemUsdcBalance';
import { useResolveAddress } from '@/hooks/useResolveAddress';
import { useEthWithdraw } from '@/hooks/useEthWithdraw';
import { useErc20Withdraw } from '@/hooks/useErc20Withdraw';
import { ETH_GAS_BUFFER_WEI, USDC_SEPOLIA_ADDRESS, TOKEN_DECIMALS } from '@/lib/constants';
import { HEX_COLORS } from '@/lib/theme';
import type { TokenType } from '@/types';

type WithdrawContainerProps = {
  token: TokenType;
};

const TOKEN_CONFIG = {
  ETH: {
    symbol: 'ETH',
    decimals: TOKEN_DECIMALS.ETH,
    parse: (value: string) => parseEther(value),
    format: (value: bigint) => formatEther(value),
    useGasBuffer: true,
  },
  USDC: {
    symbol: 'USDC',
    decimals: TOKEN_DECIMALS.USDC,
    parse: (value: string) => parseUnits(value, TOKEN_DECIMALS.USDC),
    format: (value: bigint) => formatUnits(value, TOKEN_DECIMALS.USDC),
    useGasBuffer: false,
  },
} as const;

export function WithdrawContainer({ token }: WithdrawContainerProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const config = TOKEN_CONFIG[token];

  const ethBalance = useViemEthBalance();
  const usdcBalance = useViemUsdcBalance();
  const ethWithdraw = useEthWithdraw();
  const usdcWithdraw = useErc20Withdraw(USDC_SEPOLIA_ADDRESS);

  const balance = token === 'ETH' ? ethBalance : usdcBalance;
  const withdrawHook = token === 'ETH' ? ethWithdraw : usdcWithdraw;

  const {
    resolvedAddress,
    isResolving,
    isValid: isValidRecipient,
    error: recipientError,
  } = useResolveAddress(recipient);

  const rawBalance = balance.data?.raw ?? 0n;
  const displayBalance = balance.data?.formatted ? parseFloat(balance.data.formatted) : 0;

  const parseAmountSafe = (value: string): bigint | null => {
    if (!value || value === '.' || value === '0.') return 0n;
    try {
      return config.parse(value);
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
  const canWithdraw = isValidAmount && isValidRecipient && !withdrawHook.isLoading;

  const handleMaxPress = () => {
    let maxAmount = rawBalance;
    if (config.useGasBuffer && rawBalance > ETH_GAS_BUFFER_WEI) {
      maxAmount = rawBalance - ETH_GAS_BUFFER_WEI;
    }
    setAmount(config.format(maxAmount));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await balance.refetch();
    setIsRefreshing(false);
  };

  const handleWithdraw = async () => {
    if (!resolvedAddress || !canWithdraw || !amountInSmallestUnit) return;

    try {
      await withdrawHook.withdraw(resolvedAddress, amountInSmallestUnit);
      await balance.refetch();
      router.push({
        pathname: '/(app)/withdraw/success',
        params: {
          amount,
          tokenSymbol: config.symbol,
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
            <Text>{withdrawHook.isLoading ? 'Withdrawing...' : 'Withdraw'}</Text>
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
        <FeatureHeader title={`Withdraw ${config.symbol}`} className="mb-6" />

        <HeroTokenInput
          value={amount}
          onChangeText={setAmount}
          tokenSymbol={config.symbol}
          balance={displayBalance}
          onMaxPress={handleMaxPress}
          isLoading={balance.isLoading}
          error={amountError}
          disabled={withdrawHook.isLoading}
        />

        <RecipientInput
          value={recipient}
          onChangeText={setRecipient}
          resolvedAddress={resolvedAddress ?? undefined}
          isResolving={isResolving}
          error={recipientError ?? undefined}
          disabled={withdrawHook.isLoading}
        />

        {withdrawHook.error && (
          <Text variant="small" className="mt-4 text-destructive">
            Transaction failed. Please try again.
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
