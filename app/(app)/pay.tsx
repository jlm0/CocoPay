import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PayContainer, type PaySource } from '@/components/containers/PayContainer';
import { useDeepLinkSource } from '@/hooks/useDeepLinkSource';
import { Spinner } from '@/components/ui/spinner';

export default function PayPage() {
  const params = useLocalSearchParams<{
    store?: string;
    storeCode?: string;
    amount?: string;
    source?: PaySource;
  }>();

  const deepLink = useDeepLinkSource();

  if (deepLink.status === 'pending') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="large" />
      </View>
    );
  }

  const isDeepLink = deepLink.status === 'deeplink';
  const storeCode = isDeepLink ? deepLink.params?.store : (params.store ?? params.storeCode);
  const amount = isDeepLink ? deepLink.params?.amount : params.amount;
  const source: PaySource =
    params.source ?? (isDeepLink ? 'deeplink' : storeCode ? 'navigation' : 'manual');

  return (
    <PayContainer
      initialStoreCode={storeCode}
      initialAmount={amount}
      source={source}
      deepLinkError={deepLink.error}
    />
  );
}
