import { useLocalSearchParams } from 'expo-router';
import { WithdrawContainer } from '@/components/containers/WithdrawContainer';

export default function WithdrawPage() {
  const { token } = useLocalSearchParams<{ token?: string }>();

  return <WithdrawContainer token={token} />;
}
