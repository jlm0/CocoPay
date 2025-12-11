import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { TokenAmountInput } from '@/components/presentational/token-amount-input';
import { RecipientInput } from '@/components/presentational/recipient-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

const MOCK_BALANCE = {
  tokenSymbol: 'ETH',
  balance: 0.23,
};

export default function WithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const isValid = numericAmount > 0 && recipient.length > 0;

  const handleWithdraw = () => {
    // TODO: Implement withdraw transaction
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <ScreenContainer>
      <FeatureHeader title={`Withdraw ${MOCK_BALANCE.tokenSymbol}`} className="mb-8" />

      <TokenAmountInput
        value={amount}
        onChangeText={setAmount}
        tokenSymbol={MOCK_BALANCE.tokenSymbol}
        balance={MOCK_BALANCE.balance}
        showTokenInBalance
        className="mb-6"
      />

      <RecipientInput value={recipient} onChangeText={setRecipient} className="mb-8" />

      <Button onPress={handleWithdraw} disabled={!isValid} className="h-14 rounded-xl">
        <Text className="font-sans-semibold text-primary-foreground">Withdraw</Text>
      </Button>

      <View className="mt-8 items-center">
        <Button variant="ghost" size="icon" onPress={handleBackPress}>
          <Icon as={ChevronDown} size={32} className="text-primary" />
        </Button>
      </View>
    </ScreenContainer>
  );
}
