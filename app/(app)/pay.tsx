import { useLocalSearchParams } from 'expo-router';
import { PayContainer } from '@/components/containers/PayContainer';

export default function PayPage() {
  const params = useLocalSearchParams<{
    storeCode?: string;
    amount?: string;
  }>();

  return <PayContainer initialStoreCode={params.storeCode} initialAmount={params.amount} />;
}
