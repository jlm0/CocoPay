import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { SectionHeader } from '@/components/presentational/section-header';
import { StoreList } from '@/components/presentational/store-list';
import type { Store } from '@/types';

const MOCK_STORES: Store[] = [
  {
    id: '1',
    name: 'CHRISCOFFEE',
    tokenSymbol: '$CHRISCOFFEE',
    storeCode: 'eth:12',
    balance: 9.9,
    isOwned: true,
  },
  {
    id: '2',
    name: 'DATERRA',
    tokenSymbol: '$DATERRA',
    storeCode: 'eth:45',
    balance: 2032.02,
    isOwned: false,
  },
  {
    id: '3',
    name: 'PARADISIO',
    tokenSymbol: '$PARADISIO',
    storeCode: 'eth:78',
    balance: 524.04,
    isOwned: false,
  },
  {
    id: '4',
    name: 'VIZU',
    tokenSymbol: '$VIZU',
    storeCode: 'eth:99',
    balance: 10.42,
    isOwned: false,
  },
];

export function HomeStores() {
  const router = useRouter();

  const handleAddPress = () => {
    router.push('/(app)/create');
  };

  const handleStorePress = (store: Store) => {
    router.push(`/(app)/store/${store.id}`);
  };

  const sortedStores = [...MOCK_STORES].sort((a, b) => {
    if (a.isOwned && !b.isOwned) return -1;
    if (!a.isOwned && b.isOwned) return 1;
    return b.balance - a.balance;
  });

  return (
    <View className="flex-1">
      <SectionHeader title="Stores" showAddButton onAddPress={handleAddPress} className="mb-1" />
      <StoreList stores={sortedStores} onStorePress={handleStorePress} />
    </View>
  );
}
