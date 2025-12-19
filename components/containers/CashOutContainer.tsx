import { useState, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { parseUnits } from 'viem';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { HeroTokenInput } from '@/components/presentational/hero-token-input';
import { StepsList } from '@/components/presentational/steps-list';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useJBCashOut } from '@/hooks/juicebox/useJBCashOut';
import { useJBCashOutQuote } from '@/hooks/juicebox/useJBCashOutQuote';
import { JB_TOKEN_DECIMALS, USDC_DECIMALS } from '@/lib/juicebox/constants';

type CashOutContainerProps = {
  projectId?: string;
  chainId?: string;
  storeName?: string;
  tokenSymbol?: string;
  balance?: string;
};

export function CashOutContainer({
  projectId: projectIdStr,
  storeName: storeNameParam,
  tokenSymbol: tokenSymbolParam,
  balance: balanceStr,
}: CashOutContainerProps) {
  const router = useRouter();

  const projectId = projectIdStr ? parseInt(projectIdStr, 10) : null;
  const balance = balanceStr ? parseFloat(balanceStr) : null;

  const isValid =
    projectId !== null &&
    !isNaN(projectId) &&
    tokenSymbolParam &&
    balance !== null &&
    !isNaN(balance);

  if (!isValid) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-destructive">Missing store information</Text>
          <Text variant="caption" className="mt-2 text-primary" onPress={() => router.back()}>
            Go back
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <CashOutContainerContent
      projectId={projectId}
      storeName={storeNameParam ?? 'Store'}
      tokenSymbol={tokenSymbolParam}
      balance={balance}
    />
  );
}

type CashOutContainerContentProps = {
  projectId: number;
  storeName: string;
  tokenSymbol: string;
  balance: number;
};

function CashOutContainerContent({
  projectId,
  storeName,
  tokenSymbol,
  balance,
}: CashOutContainerContentProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');

  const { cashOut, isLoading, error } = useJBCashOut(BigInt(projectId));

  const tokenAmountWei = useMemo(() => {
    if (!amount || amount === '.' || amount === '0.') return 0n;
    try {
      return parseUnits(amount, JB_TOKEN_DECIMALS);
    } catch {
      return 0n;
    }
  }, [amount]);

  const { quote, isLoading: quoteLoading } = useJBCashOutQuote(
    tokenAmountWei > 0n
      ? {
          projectId: BigInt(projectId),
          tokenAmount: tokenAmountWei,
        }
      : null
  );

  const numericAmount = parseFloat(amount) || 0;
  const amountExceedsBalance = numericAmount > balance;
  const amountError = amountExceedsBalance ? 'Amount exceeds balance' : undefined;

  const isValidAmount = numericAmount > 0 && !amountExceedsBalance;
  const canCashOut = isValidAmount && !isLoading;

  const estimateText = useMemo(() => {
    if (!quote || quote.netAmount === 0n) return undefined;
    const usdcAmount = Number(quote.netAmount) / 10 ** USDC_DECIMALS;
    return `≈ $${usdcAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
  }, [quote]);

  const handleMaxPress = () => {
    setAmount(balance.toString());
  };

  const handleCashOut = async () => {
    if (!canCashOut || tokenAmountWei === 0n) return;

    try {
      const minReceived = quote?.netAmount ? (quote.netAmount * 95n) / 100n : 0n;

      const result = await cashOut({
        tokenAmount: tokenAmountWei,
        minReceived,
      });

      const usdcReceived = Number(result.amountReceived) / 10 ** USDC_DECIMALS;

      router.push({
        pathname: '/(app)/cashout/success',
        params: {
          txHash: result.txHash,
          tokenAmount: amount,
          tokenSymbol,
          usdcAmount: usdcReceived.toFixed(2),
          storeName,
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
            onPress={handleCashOut}
            disabled={!canCashOut}
            size="lg"
            className="h-14 rounded-xl">
            <Text>{isLoading ? 'Cashing out...' : 'Cash out'}</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-64">
        <FeatureHeader title={`Cash out ${tokenSymbol}`} className="mb-6" />

        <StepsList
          title="How cash out works"
          steps={[
            `Exchange your ${tokenSymbol} tokens for USDC.`,
            'Receive USDC directly to your wallet.',
            'A 2.5% protocol fee applies.',
          ]}
          className="mb-8"
        />

        <HeroTokenInput
          value={amount}
          onChangeText={setAmount}
          tokenSymbol={tokenSymbol}
          balance={balance}
          onMaxPress={handleMaxPress}
          error={amountError}
          estimate={estimateText}
          estimateLoading={quoteLoading && tokenAmountWei > 0n}
          disabled={isLoading}
        />

        {error && (
          <Text variant="small" className="mt-4 text-center text-destructive">
            Transaction failed. Please try again.
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
