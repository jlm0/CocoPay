import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { StoreBalance } from '@/components/presentational/store-balance';
import { StoreValueRow } from '@/components/presentational/store-value-row';
import { StoreActions } from '@/components/presentational/store-actions';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import type { StoreDetails } from '@/types';

const MOCK_STORE_DETAILS: Record<string, StoreDetails> = {
  '1': {
    id: '1',
    name: 'Chris Coffee',
    tokenSymbol: '$CHRISCOFFEE',
    storeCode: 'eth:12',
    balance: 1389,
    isOwned: true,
    valueAtStore: 69.13,
    cashOutValue: 53.23,
    borrowValue: 49.23,
  },
  '2': {
    id: '2',
    name: 'Daterra',
    tokenSymbol: '$DATERRA',
    storeCode: 'eth:45',
    balance: 2032,
    isOwned: false,
    valueAtStore: 101.6,
    cashOutValue: 78.24,
    borrowValue: 65.12,
  },
  '3': {
    id: '3',
    name: 'Paradisio',
    tokenSymbol: '$PARADISIO',
    storeCode: 'eth:78',
    balance: 524,
    isOwned: false,
    valueAtStore: 26.2,
    cashOutValue: 20.18,
    borrowValue: 16.82,
  },
  '4': {
    id: '4',
    name: 'Vizu',
    tokenSymbol: '$VIZU',
    storeCode: 'eth:99',
    balance: 10,
    isOwned: false,
    valueAtStore: 0.5,
    cashOutValue: 0.38,
    borrowValue: 0.32,
  },
};

export default function StoreDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const store = MOCK_STORE_DETAILS[id ?? '1'];

  const handleBorrowPress = () => {
    router.push('/(app)/borrow');
  };

  const handleCashOutPress = () => {
    router.push('/(app)/cashout');
  };

  const handleSpendPress = () => {
    router.push('/(app)/pay');
  };

  const handleChargePress = () => {
    router.push('/(app)/charge');
  };

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
