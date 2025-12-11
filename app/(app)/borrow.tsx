import { useState } from 'react';
import { ScrollView } from 'react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { StepsList } from '@/components/presentational/steps-list';
import { PrepaySlider } from '@/components/presentational/prepay-slider';
import { TokenAmountInput } from '@/components/presentational/token-amount-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const MOCK_STORE = {
  tokenSymbol: '$OM',
  balance: 50239,
  borrowRate: 0.00329,
};

export default function BorrowPage() {
  const [collateralAmount, setCollateralAmount] = useState('');
  const [prepayMonths, setPrepayMonths] = useState(40);

  const numericAmount = parseFloat(collateralAmount) || 0;
  const usdcValue = numericAmount * MOCK_STORE.borrowRate;

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleBorrow = () => {
    // TODO: Implement borrow transaction
  };

  return (
    <ScreenContainer
      horizontalPadding={false}
      bottomActionBar={
        <BottomActionBar>
          <Button onPress={handleBorrow} disabled={numericAmount <= 0} className="h-14 rounded-xl">
            <Text className="font-sans-semibold text-primary-foreground">Borrow</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-64">
        <FeatureHeader title={`Borrow against ${MOCK_STORE.tokenSymbol}`} className="mb-6" />

        <StepsList
          title="How borrowing works"
          steps={[
            `Use your ${MOCK_STORE.tokenSymbol} tokens as collateral.`,
            'Prepay future interest upfront.',
            'Receive USDC instantly.',
            'Repay anytime to get your tokens back.',
          ]}
          className="mb-8"
        />

        <TokenAmountInput
          value={collateralAmount}
          onChangeText={setCollateralAmount}
          tokenSymbol={MOCK_STORE.tokenSymbol}
          balance={MOCK_STORE.balance}
          className="mb-6"
        />

        <PrepaySlider
          value={prepayMonths}
          onValueChange={setPrepayMonths}
          minMonths={6}
          maxMonths={120}
          className="mb-6"
        />

        <Text variant="body">
          You&apos;re borrowing{' '}
          <Text variant="body" className="font-sans-semibold">
            {formatCurrency(usdcValue)} USDC
          </Text>
          .
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
