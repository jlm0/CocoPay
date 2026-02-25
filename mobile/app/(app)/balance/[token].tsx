import { useLocalSearchParams, Redirect } from 'expo-router';
import { TokenBalanceContainer } from '@/components/containers/TokenBalanceContainer';

export default function BalancePage() {
  const { token } = useLocalSearchParams<{ token: string }>();

  if (token === 'ETH') {
    return <Redirect href="/(app)/balance/USDC" />;
  }

  return <TokenBalanceContainer />;
}
