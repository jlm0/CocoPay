import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { ChevronDown } from 'lucide-react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { BalanceDisplay } from '@/components/presentational/balance-display';
import { DepositAddress } from '@/components/presentational/deposit-address';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

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

  const handleBackPress = () => {
    router.back();
  };

  return (
    <ScreenContainer>
      <FeatureHeader title={tokenSymbol} className="mb-8" />

      <BalanceDisplay amount={balance.amount} tokenSymbol={tokenSymbol} className="mb-8" />

      <DepositAddress tokenName={tokenSymbol} address={balance.address} className="mb-8" />

      <View className="gap-3">
        <Button variant="secondary" onPress={handleCopyAddress} className="h-14 rounded-xl">
          <Text className="font-semibold text-secondary-foreground">Copy deposit address</Text>
        </Button>

        <Button onPress={handleWithdraw} className="h-14 rounded-xl">
          <Text className="font-semibold text-primary-foreground">Withdraw</Text>
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
