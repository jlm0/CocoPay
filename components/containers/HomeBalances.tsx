import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { BalanceCard } from '@/components/presentational/balance-card';
import { FeatureHeader } from '@/components/presentational/feature-header';
import type { Balance } from '@/types';

const MOCK_BALANCES: Balance[] = [
  { token: 'USDC', amount: 3411.83, usdValue: 3411.83 },
  { token: 'ETH', amount: 1.25, usdValue: 3242.12 },
];

export function HomeBalances() {
  const router = useRouter();

  const handleBalancePress = (token: string) => {
    router.push(`/(app)/balance/${token}`);
  };

  return (
    <View className="mb-6">
      <FeatureHeader title="Balances" className="mb-4" />
      <BalanceCard balances={MOCK_BALANCES} onBalancePress={handleBalancePress} />
    </View>
  );
}
