import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { StoreCodeInput } from '@/components/presentational/store-code-input';
import { PaymentAmountInput } from '@/components/presentational/payment-amount-input';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

const MOCK_STORES: Record<string, string> = {
  'eth:83': 'Ohm Coffee',
  'eth:12': 'Chris Coffee',
  'eth:45': 'Daterra',
};

export default function PayPage() {
  const router = useRouter();
  const [storeCode, setStoreCode] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<string>('USDC');

  const storeName = MOCK_STORES[storeCode];
  const numericAmount = parseFloat(amount.replace('$', '')) || 0;
  const isValid = numericAmount > 0 && storeName !== undefined;

  const availableTokens = ['USDC', 'ETH'];
  if (storeName) {
    const storeToken = `$${storeName.split(' ')[0].toUpperCase()}`;
    if (!availableTokens.includes(storeToken)) {
      availableTokens.push(storeToken);
    }
  }

  const savingsHint =
    storeName && selectedToken === 'USDC'
      ? `Save $3.50 if you use your $${storeName.split(' ')[0].toUpperCase()}`
      : undefined;

  const handleScanQR = () => {
    // TODO: Implement QR scanning
  };

  const handlePay = () => {
    // TODO: Implement payment transaction
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <ScreenContainer>
      <FeatureHeader title="Make a payment" className="mb-8" />

      <StoreCodeInput
        value={storeCode}
        onChangeText={setStoreCode}
        storeName={storeName}
        className="mb-6"
      />

      <PaymentAmountInput
        value={amount}
        onChangeText={setAmount}
        selectedToken={selectedToken}
        onTokenChange={setSelectedToken}
        availableTokens={availableTokens}
        savingsHint={savingsHint}
        className="mb-8"
      />

      <View className="gap-3">
        <Button variant="secondary" onPress={handleScanQR} className="h-14 rounded-xl">
          <Text className="font-semibold text-secondary-foreground">Scan QR</Text>
        </Button>

        <Button onPress={handlePay} disabled={!isValid} className="h-14 rounded-xl">
          <Text className="font-semibold text-primary-foreground">Pay</Text>
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
