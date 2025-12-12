import { useState } from 'react';
import { ScrollView } from 'react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { TokenAmountInput } from '@/components/presentational/token-amount-input';
import { RecipientInput } from '@/components/presentational/recipient-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const MOCK_BALANCE = {
  tokenSymbol: 'ETH',
  balance: 0.23,
};

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const isValid = numericAmount > 0 && recipient.length > 0;

  const handleWithdraw = () => {
    // TODO: Implement withdraw transaction
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar>
          <Button
            onPress={handleWithdraw}
            disabled={!isValid}
            size="lg"
            className="h-14 rounded-xl">
            <Text>Withdraw</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-64">
        <FeatureHeader title={`Withdraw ${MOCK_BALANCE.tokenSymbol}`} className="mb-8" />

        <TokenAmountInput
          value={amount}
          onChangeText={setAmount}
          tokenSymbol={MOCK_BALANCE.tokenSymbol}
          balance={MOCK_BALANCE.balance}
          showTokenInBalance
          className="mb-6"
        />

        <RecipientInput value={recipient} onChangeText={setRecipient} />
      </ScrollView>
    </ScreenContainer>
  );
}
