import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { BalanceDisplay } from '@/components/presentational/balance-display';
import { DepositAddress } from '@/components/presentational/deposit-address';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const MOCK_BALANCES: Record<string, { amount: number; address: string }> = {
  ETH: {
    amount: 0.23,
    address: '0x5138a42C3D5065debE950deBDa10C1f38150a908',
  },
  USDC: {
    amount: 3411.83,
    address: '0x5138a42C3D5065debE950deBDa10C1f38150a908',
  },
};

export default function BalancePage() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();

  const tokenSymbol = token ?? 'ETH';
  const balance = MOCK_BALANCES[tokenSymbol] ?? MOCK_BALANCES.ETH;

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(balance.address);
  };

  const handleWithdraw = () => {
    router.push('/(app)/withdraw');
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar>
          <Button
            variant="secondary"
            onPress={handleCopyAddress}
            size="lg"
            className="h-14 rounded-xl">
            <Text>Copy deposit address</Text>
          </Button>

          <Button onPress={handleWithdraw} size="lg" className="h-14 rounded-xl">
            <Text>Withdraw</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-64">
        <FeatureHeader title={tokenSymbol} className="mb-8" />

        <BalanceDisplay amount={balance.amount} tokenSymbol={tokenSymbol} className="mb-8" />

        <DepositAddress tokenName={tokenSymbol} address={balance.address} />
      </ScrollView>
    </ScreenContainer>
  );
}
