import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { AmountInput } from '@/components/presentational/amount-input';
import { NoteInput } from '@/components/presentational/note-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

const MOCK_STORE = {
  name: 'Ohm Coffee',
  storeCode: 'eth:83',
};

export default function ChargePage() {
  const router = useRouter();
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

  const handleBackPress = () => {
    router.back();
  };

  return (
    <ScreenContainer>
      <FeatureHeader
        title={MOCK_STORE.name}
        subtitle={`Store code ${MOCK_STORE.storeCode}`}
        className="mb-8"
      />

      <AmountInput value={amount} onChangeText={setAmount} className="mb-6" />

      <NoteInput value={note} onChangeText={setNote} className="mb-8" />

      <View className="gap-3">
        <Button
          variant="secondary"
          onPress={handleSendInvoice}
          disabled={!isValid}
          className="h-14 rounded-xl">
          <Text className="font-sans-semibold text-secondary-foreground">Send invoice</Text>
        </Button>

        <Button onPress={handleGenerateQR} disabled={!isValid} className="h-14 rounded-xl">
          <Text className="font-sans-semibold text-primary-foreground">Generate QR</Text>
        </Button>
      </View>

      <View className="mt-8 items-center">
        <Button variant="ghost" size="icon" onPress={handleBackPress}>
          <Icon as={ChevronDown} size={32} className="text-primary" />
        </Button>
      </View>
    </ScreenContainer>
  );
}
