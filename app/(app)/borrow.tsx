import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { StepsList } from '@/components/presentational/steps-list';
import { PrepaySlider } from '@/components/presentational/prepay-slider';
import { TokenAmountInput } from '@/components/presentational/token-amount-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

const MOCK_STORE = {
  tokenSymbol: '$OM',
  balance: 50239,
  borrowRate: 0.00329,
};

export default function BorrowPage() {
  const router = useRouter();
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

  const handleBackPress = () => {
    router.back();
  };

  return (
    <ScreenContainer horizontalPadding={false}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
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

        <Text variant="body" className="mb-6">
          You&apos;re borrowing{' '}
          <Text variant="body" className="font-sans-semibold">
            {formatCurrency(usdcValue)} USDC
          </Text>
          .
        </Text>

        <Button onPress={handleBorrow} disabled={numericAmount <= 0} className="h-14 rounded-xl">
          <Text className="font-sans-semibold text-primary-foreground">Borrow</Text>
        </Button>

        <Button variant="ghost" size="icon" onPress={handleBackPress} className="my-4 self-center">
          <Icon as={ChevronDown} size={32} className="text-primary" />
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}
