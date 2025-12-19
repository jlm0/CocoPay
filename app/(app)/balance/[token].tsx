import { useLocalSearchParams } from 'expo-router';
import { TokenBalanceContainer } from '@/components/containers/TokenBalanceContainer';

export default function BalancePage() {
  const { token } = useLocalSearchParams<{ token: string }>();

  return <TokenBalanceContainer tokenSymbol={token} />;
}
