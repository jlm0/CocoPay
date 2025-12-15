import { useLocalSearchParams } from 'expo-router';
import { ChargeContainer, type ChargeSource } from '@/components/containers/ChargeContainer';

export default function ChargePage() {
  const params = useLocalSearchParams<{
    store?: string;
    storeName?: string;
    amount?: string;
    source?: ChargeSource;
  }>();

  return (
    <ChargeContainer
      initialStoreCode={params.store}
      initialStoreName={params.storeName}
      initialAmount={params.amount}
      source={params.source}
    />
  );
}
