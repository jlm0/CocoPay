import { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { StoreBalance } from '@/components/presentational/store-balance';
import { StoreValueRow } from '@/components/presentational/store-value-row';
import { StoreActions } from '@/components/presentational/store-actions';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { useStoreDetails } from '@/hooks/useStoreDetails';
import { parseStoreCode } from '@/lib/juicebox/transforms';
import { COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';

export default function StoreDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const parsedId = (() => {
    if (!id) return { chainId: COCOPAY_CHAIN_ID, projectId: 0 };
    if (id.includes('-')) {
      return {
        chainId: parseInt(id.split('-')[0], 10),
        projectId: parseInt(id.split('-')[1], 10),
      };
    }
    if (id.includes(':')) {
      const parsed = parseStoreCode(id);
      if (parsed) {
        return { chainId: parsed.chainId, projectId: Number(parsed.projectId) };
      }
    }
    return { chainId: COCOPAY_CHAIN_ID, projectId: parseInt(id, 10) };
  })();

  useEffect(() => {
    console.log(
      `[StoreDetailPage] id param="${id}" parsed: projectId=${parsedId.projectId} chainId=${parsedId.chainId}`
    );
  }, [id, parsedId.projectId, parsedId.chainId]);

  const { store, isLoading, error } = useStoreDetails(parsedId.projectId, parsedId.chainId);

  useEffect(() => {
    console.log(
      `[StoreDetailPage] store state: loading=${isLoading} error=${error?.message ?? 'none'} hasStore=${!!store}`
    );
  }, [store, isLoading, error]);

  const handleBorrowPress = () => {
    router.push('/(app)/borrow');
  };

  const handleCashOutPress = () => {
    router.push('/(app)/cashout');
  };

  const handleSpendPress = () => {
    router.push(`/(app)/pay?store=${store?.storeCode}&source=navigation`);
  };

  const handleChargePress = () => {
    router.push('/(app)/charge');
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Spinner size="large" />
        </View>
      </ScreenContainer>
    );
  }

  if (error || !store) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-destructive">Store not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const valueItems = [
    { label: 'Value at store', value: store.valueAtStore },
    { label: 'Cash out value', value: store.cashOutValue },
    { label: 'Borrow value', value: store.borrowValue },
  ];

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar>
          <StoreActions
            isOwned={store.isOwned}
            onBorrowPress={handleBorrowPress}
            onCashOutPress={handleCashOutPress}
            onSpendPress={handleSpendPress}
            onChargePress={handleChargePress}
          />
        </BottomActionBar>
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-64">
        <FeatureHeader
          title={store.name}
          subtitle={`Store code ${store.storeCode}`}
          className="mb-6"
        />

        <StoreBalance balance={store.balance} tokenSymbol={store.tokenSymbol} className="mb-6" />

        <StoreValueRow values={valueItems} />
      </ScrollView>
    </ScreenContainer>
  );
}
