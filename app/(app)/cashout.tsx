import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { StepsList } from '@/components/presentational/steps-list';
import { TokenAmountInput } from '@/components/presentational/token-amount-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

const MOCK_STORE = {
  tokenSymbol: '$OM',
  balance: 50239,
  cashOutRate: 0.00376,
};

export default function CashOutPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const usdcValue = numericAmount * MOCK_STORE.cashOutRate;

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCashOut = () => {
    // TODO: Implement cash out transaction
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <ScreenContainer>
      <FeatureHeader title={`Cash out ${MOCK_STORE.tokenSymbol}`} className="mb-6" />

      <StepsList
        title="How cash out works"
        steps={[
          `Exchange your ${MOCK_STORE.tokenSymbol} tokens for USDC.`,
          'Receive USDC directly to your wallet.',
          'No waiting period required.',
        ]}
        className="mb-8"
      />

      <TokenAmountInput
        value={amount}
        onChangeText={setAmount}
        tokenSymbol={MOCK_STORE.tokenSymbol}
        balance={MOCK_STORE.balance}
        className="mb-6"
      />

      <Text variant="body" className="mb-6">
        You get{' '}
        <Text variant="body" className="font-sans-semibold">
          {formatCurrency(usdcValue)} USDC
        </Text>
      </Text>

      <Button onPress={handleCashOut} disabled={numericAmount <= 0} className="h-14 rounded-xl">
        <Text className="font-sans-semibold text-primary-foreground">Cash out</Text>
      </Button>

      <View className="mt-8 items-center">
        <Button variant="ghost" size="icon" onPress={handleBackPress}>
          <Icon as={ChevronDown} size={32} className="text-primary" />
        </Button>
      </View>
    </ScreenContainer>
  );
}
