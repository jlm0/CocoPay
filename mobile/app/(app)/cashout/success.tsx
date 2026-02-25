import { useLocalSearchParams, useRouter } from 'expo-router';
import { CashOutSuccess } from '@/components/presentational/cashout-success';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function CashOutSuccessPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    txHash: string;
    tokenAmount: string;
    tokenSymbol: string;
    usdcAmount: string;
    storeName: string;
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
      <CashOutSuccess
        tokenAmount={params.tokenAmount ?? '0'}
        tokenSymbol={params.tokenSymbol ?? ''}
        usdcAmount={params.usdcAmount ?? '0'}
        storeName={params.storeName ?? 'Store'}
      />
    </ScreenContainer>
  );
}
