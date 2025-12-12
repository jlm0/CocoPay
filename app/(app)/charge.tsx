import { useState } from 'react';
import { ScrollView } from 'react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { AmountInput } from '@/components/presentational/amount-input';
import { NoteInput } from '@/components/presentational/note-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const MOCK_STORE = {
  name: 'Ohm Coffee',
  storeCode: 'eth:83',
};

export default function ChargePage() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const numericAmount = parseFloat(amount.replace('$', '')) || 0;
  const isValid = numericAmount > 0;

  const handleSendInvoice = () => {
    // TODO: Implement share sheet with payment link
  };

  const handleGenerateQR = () => {
    // TODO: Implement QR code generation
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar>
          <Button
            variant="secondary"
            onPress={handleSendInvoice}
            disabled={!isValid}
            size="lg"
            className="h-14 rounded-xl">
            <Text>Send invoice</Text>
          </Button>

          <Button
            onPress={handleGenerateQR}
            disabled={!isValid}
            size="lg"
            className="h-14 rounded-xl">
            <Text>Generate QR</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-64">
        <FeatureHeader
          title={MOCK_STORE.name}
          subtitle={`Store code ${MOCK_STORE.storeCode}`}
          className="mb-8"
        />

        <AmountInput value={amount} onChangeText={setAmount} className="mb-6" />

        <NoteInput value={note} onChangeText={setNote} />
      </ScrollView>
    </ScreenContainer>
  );
}
