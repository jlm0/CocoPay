import { useState, useMemo } from 'react';
import { ScrollView } from 'react-native';
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
  projectId: number;
  chainId: number;
  storeName: string;
  tokenSymbol: string;
  balance: number;
};

export function CashOutContainer({
  projectId,
  storeName,
  tokenSymbol,
  balance,
}: CashOutContainerProps) {
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
