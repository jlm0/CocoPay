import { useLocalSearchParams, useRouter } from 'expo-router';
import { PaymentSuccess } from '@/components/presentational/payment-success';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function PaySuccessPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    txHash: string;
    amount: string;
    storeName: string;
    tokensReceived: string;
  }>();

  const handleDone = () => {
    router.push('/(app)/home');
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar showBackButton={false}>
          <Button onPress={handleDone} size="lg" className="h-14 flex-1 rounded-xl">
            <Text>Done</Text>
          </Button>
        </BottomActionBar>
      }>
      <PaymentSuccess
        amount={params.amount ?? '0'}
        storeName={params.storeName ?? 'Unknown'}
        tokensReceived={params.tokensReceived ?? '0'}
      />
    </ScreenContainer>
  );
}
