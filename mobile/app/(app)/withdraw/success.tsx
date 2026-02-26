import { useLocalSearchParams, useRouter } from 'expo-router';
import { WithdrawSuccess } from '@/components/presentational/withdraw-success';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function WithdrawSuccessPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    amount: string;
    tokenSymbol: string;
    recipient: string;
  }>();

  const handleDone = () => {
    router.push('/(app)/home');
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar showBackButton={false}>
          <Button onPress={handleDone} size="lg" className="h-14 flex-1">
            <Text>Done</Text>
          </Button>
        </BottomActionBar>
      }>
      <WithdrawSuccess
        amount={params.amount ?? '0'}
        tokenSymbol={params.tokenSymbol ?? ''}
        recipient={params.recipient ?? ''}
      />
    </ScreenContainer>
  );
}
