import { Share, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { QRCodeDisplay } from '@/components/presentational/qr-code-display';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function ChargeQRPage() {
  const params = useLocalSearchParams<{
    store: string;
    storeName: string;
    amount: string;
    paymentUrl: string;
  }>();

  const handleShare = async () => {
    await Share.share({
      message: `Pay ${params.storeName} $${params.amount} with CocoPay: ${params.paymentUrl}`,
      url: params.paymentUrl,
    });
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar>
          <Button onPress={handleShare} size="lg" className="h-14 rounded-xl">
            <Text>Share link</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-1 pb-64"
        contentContainerStyle={{ justifyContent: 'center' }}>
        <FeatureHeader title="Payment Request" className="mb-8" />

        <QRCodeDisplay
          value={params.paymentUrl ?? ''}
          storeName={params.storeName ?? 'Unknown'}
          storeCode={params.store ?? ''}
          amount={params.amount ?? '0'}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
