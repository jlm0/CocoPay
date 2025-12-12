import { useLocalSearchParams } from 'expo-router';
import { TokenBalanceContainer } from '@/components/containers/TokenBalanceContainer';
import type { TokenType } from '@/types';

export default function BalancePage() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const tokenSymbol = (token ?? 'ETH') as TokenType;

  return <TokenBalanceContainer tokenSymbol={tokenSymbol} />;
}
