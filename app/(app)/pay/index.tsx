import { useLocalSearchParams } from 'expo-router';
import { PayContainer, type PaySource } from '@/components/containers/PayContainer';
import { useDeepLinkSource } from '@/hooks/useDeepLinkSource';

export default function PayPage() {
  const params = useLocalSearchParams<{
    store?: string;
    storeCode?: string;
    amount?: string;
    source?: PaySource;
  }>();

  const deepLink = useDeepLinkSource();

  return (
    <PayContainer
      routeStore={params.store}
      routeStoreCode={params.storeCode}
      routeAmount={params.amount}
      routeSource={params.source}
      deepLink={deepLink}
    />
  );
}
