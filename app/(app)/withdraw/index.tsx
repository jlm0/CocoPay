import { useLocalSearchParams } from 'expo-router';
import { WithdrawContainer } from '@/components/containers/WithdrawContainer';
import type { TokenType } from '@/types';

export default function WithdrawPage() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const tokenType: TokenType = token === 'USDC' ? 'USDC' : 'ETH';

  return <WithdrawContainer token={tokenType} />;
}
