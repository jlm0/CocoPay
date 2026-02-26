import { useState, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { parseUnits } from 'viem';
import { calcPrepaidFee } from 'juice-sdk-core';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { HeroTokenInput } from '@/components/presentational/hero-token-input';
import { StepsList } from '@/components/presentational/steps-list';
import { PrepaySlider } from '@/components/presentational/prepay-slider';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useJBLoanBorrow } from '@/hooks/juicebox/useJBLoanBorrow';
import { useJBLoanQuote } from '@/hooks/juicebox/useJBLoanQuote';
import { JB_TOKEN_DECIMALS, USDC_DECIMALS, type OmnichainChainId } from '@/lib/juicebox/constants';
import { isOmnichainChainId } from '@/lib/juicebox/chain-selection';
import { invalidateAfterCashOut } from '@/lib/query';

type BorrowContainerProps = {
  projectId?: string;
  chainId?: string;
  storeName?: string;
  tokenSymbol?: string;
  balance?: string;
};

export function BorrowContainer({
  projectId: projectIdStr,
  chainId: chainIdStr,
  storeName: storeNameParam,
  tokenSymbol: tokenSymbolParam,
  balance: balanceStr,
}: BorrowContainerProps) {
  const router = useRouter();

  const projectId = projectIdStr ? parseInt(projectIdStr, 10) : null;
  const chainId = chainIdStr ? parseInt(chainIdStr, 10) : null;
  const balance = balanceStr ? parseFloat(balanceStr) : null;

  const isValidChainId = chainId !== null && !isNaN(chainId) && isOmnichainChainId(chainId);
  const isValid =
    projectId !== null &&
    !isNaN(projectId) &&
    isValidChainId &&
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
    <BorrowContainerContent
      projectId={projectId}
      chainId={chainId as OmnichainChainId}
      storeName={storeNameParam ?? 'Store'}
      tokenSymbol={tokenSymbolParam}
      balance={balance}
    />
  );
}

type BorrowContainerContentProps = {
  projectId: number;
  chainId: OmnichainChainId;
  storeName: string;
  tokenSymbol: string;
  balance: number;
};

function BorrowContainerContent({
  projectId,
  chainId,
  storeName,
  tokenSymbol,
  balance,
}: BorrowContainerContentProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [prepayMonths, setPrepayMonths] = useState(12);

  const { borrow, isLoading, error } = useJBLoanBorrow(BigInt(projectId), chainId);

  const collateralAmountWei = useMemo(() => {
    if (!amount || amount === '.' || amount === '0.') return 0n;
    try {
      return parseUnits(amount, JB_TOKEN_DECIMALS);
    } catch {
      return 0n;
    }
  }, [amount]);

  const { quote, isLoading: quoteLoading } = useJBLoanQuote(
    collateralAmountWei > 0n
      ? {
          projectId: BigInt(projectId),
          collateralAmount: collateralAmountWei,
        }
      : null,
    chainId
  );

  const prepayFeePercent = useMemo(() => {
    if (!quote) return 0;
    const monthsInSeconds = prepayMonths * 30 * 24 * 60 * 60;
    return Number(calcPrepaidFee(monthsInSeconds));
  }, [quote, prepayMonths]);

  const borrowableAfterFee = useMemo(() => {
    if (!quote) return 0n;
    const feeAmount = (quote.borrowableAmount * BigInt(prepayFeePercent)) / 10000n;
    return quote.borrowableAmount - feeAmount;
  }, [quote, prepayFeePercent]);

  const numericAmount = parseFloat(amount) || 0;
  const amountExceedsBalance = numericAmount > balance;
  const amountError = amountExceedsBalance ? 'Amount exceeds balance' : undefined;

  const isValidAmount = numericAmount > 0 && !amountExceedsBalance;
  const canBorrow = isValidAmount && !isLoading && quote !== null;

  const estimateText = useMemo(() => {
    if (!quote || borrowableAfterFee === 0n) return undefined;
    const usdcAmount = Number(borrowableAfterFee) / 10 ** USDC_DECIMALS;
    return `≈ $${usdcAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
  }, [quote, borrowableAfterFee]);

  const handleMaxPress = () => {
    setAmount(balance.toString());
  };

  const handleBorrow = async () => {
    if (!canBorrow || collateralAmountWei === 0n || !quote) return;

    try {
      const minBorrowAmount = (borrowableAfterFee * 95n) / 100n;

      const result = await borrow({
        collateralAmount: collateralAmountWei,
        minBorrowAmount,
        prepaidFeePercent: prepayFeePercent,
      });

      const usdcReceived = Number(result.loan.amount) / 10 ** USDC_DECIMALS;

      invalidateAfterCashOut(projectId, chainId);

      router.push({
        pathname: '/(app)/borrow/success',
        params: {
          txHash: result.txHash,
          tokenAmount: amount,
          tokenSymbol,
          usdcAmount: usdcReceived.toFixed(2),
          storeName,
          loanId: result.loan.id.toString(),
          prepayMonths: prepayMonths.toString(),
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
          <Button onPress={handleBorrow} disabled={!canBorrow} size="lg" className="h-14">
            <Text>{isLoading ? 'Borrowing...' : 'Cash out'}</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-64">
        <FeatureHeader title={`Cash out ${tokenSymbol}`} className="mb-6" />

        <StepsList
          title="How cash out works"
          steps={[
            `Use your ${tokenSymbol} tokens as collateral.`,
            'Prepay future interest upfront.',
            'Receive USDC instantly.',
            'Repay anytime to get your tokens back.',
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
          estimateLoading={quoteLoading && collateralAmountWei > 0n}
          disabled={isLoading}
        />

        <PrepaySlider
          value={prepayMonths}
          onValueChange={setPrepayMonths}
          minMonths={6}
          maxMonths={120}
          className="mt-6"
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
