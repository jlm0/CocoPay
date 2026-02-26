import { useState, useMemo } from 'react';
import { View, ScrollView, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { HeroAmountInput } from '@/components/presentational/hero-amount-input';
import { ChargeStoreInfo } from '@/components/presentational/charge-store-info';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { buildPayLink } from '@/lib/url/pay-link';

export type ChargeSource = 'store' | 'manual';

type ChargeContainerProps = {
  initialStoreCode?: string;
  initialStoreName?: string;
  initialAmount?: string;
  source?: ChargeSource;
};

export function ChargeContainer({
  initialStoreCode = '',
  initialStoreName = '',
  initialAmount = '',
}: ChargeContainerProps) {
  const router = useRouter();
  const [amountRaw, setAmountRaw] = useState(initialAmount);

  const displayAmount = amountRaw ? `$${amountRaw}` : '';

  const numericAmount = useMemo(() => {
    return parseFloat(amountRaw) || 0;
  }, [amountRaw]);

  const isValidAmount = numericAmount > 0;
  const canGenerate = isValidAmount && !!initialStoreCode;

  const handleAmountChange = (newAmount: string) => {
    const cleaned = newAmount.replace(/[$,]/g, '');
    setAmountRaw(cleaned);
  };

  const handleShare = async () => {
    if (!canGenerate) return;

    const paymentUrl = buildPayLink(initialStoreCode, amountRaw);
    await Share.share({
      message: `Pay ${initialStoreName} $${amountRaw} with CocoPay: ${paymentUrl}`,
      url: paymentUrl,
    });
  };

  const handleGenerateQR = () => {
    if (!canGenerate) return;

    const paymentUrl = buildPayLink(initialStoreCode, amountRaw);
    router.push({
      pathname: '/(app)/charge-qr',
      params: {
        store: initialStoreCode,
        storeName: initialStoreName,
        amount: amountRaw,
        paymentUrl,
      },
    });
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar>
          <Button
            variant="secondary"
            onPress={handleShare}
            disabled={!canGenerate}
            size="lg"
            className="h-14">
            <Text>Share link</Text>
          </Button>

          <Button onPress={handleGenerateQR} disabled={!canGenerate} size="lg" className="h-14">
            <Text>Generate QR</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-64">
        <FeatureHeader title="Charge" className="mb-6" />

        {initialStoreName && initialStoreCode && (
          <ChargeStoreInfo
            storeName={initialStoreName}
            storeCode={initialStoreCode}
            className="mb-4"
          />
        )}

        <View className="flex-1">
          <HeroAmountInput value={displayAmount} onChangeText={handleAmountChange} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
