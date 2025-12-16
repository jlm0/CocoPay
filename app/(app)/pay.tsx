import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PayContainer, type PaySource } from '@/components/containers/PayContainer';
import { useDeepLinkSource } from '@/hooks/useDeepLinkSource';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';

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
      <ScreenContainer
        bottomActionBar={
          <BottomActionBar>
            <Button variant="secondary" disabled size="lg" className="h-14 rounded-xl">
              <Text>Scan QR</Text>
            </Button>
            <Button disabled size="lg" className="h-14 rounded-xl">
              <Text>Pay</Text>
            </Button>
          </BottomActionBar>
        }>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-64">
          <FeatureHeader title="Pay" className="mb-6" />
          <Skeleton className="mb-4 h-20 w-full rounded-xl" />
          <View className="items-center">
            <Skeleton className="h-16 w-48 rounded-lg" />
          </View>
        </ScrollView>
      </ScreenContainer>
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
