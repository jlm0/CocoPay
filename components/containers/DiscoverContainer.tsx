import { useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { DiscoverScreen } from '@/components/presentational/discover-screen';
import { DiscoverSortContent } from '@/components/presentational/discover-sort-content';
import { BottomSheet, type BottomSheetMethods } from '@/components/ui/bottom-sheet';
import { useDiscoverStores } from '@/hooks/useDiscoverStores';
import type { DiscoverStore, SortOption, ViewMode } from '@/types';

const filterStores = (stores: DiscoverStore[], query: string): DiscoverStore[] => {
  if (!query.trim()) return stores;
  const lower = query.toLowerCase();
  return stores.filter(
    (s) =>
      s.name.toLowerCase().includes(lower) || s.address?.formatted.toLowerCase().includes(lower)
  );
};

const sortStores = (stores: DiscoverStore[], sortBy: SortOption): DiscoverStore[] => {
  const sorted = [...stores];
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'cashback':
      return sorted.sort((a, b) => b.cashBackPercent - a.cashBackPercent);
    default:
      return sorted;
  }
};

export function DiscoverContainer() {
  const router = useRouter();
  const sortSheetRef = useRef<BottomSheetMethods>(null);

  const { stores: rawStores, isLoading, error } = useDiscoverStores();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const filteredAndSortedStores = useMemo(() => {
    const filtered = filterStores(rawStores, searchQuery);
    return sortStores(filtered, sortBy);
  }, [rawStores, searchQuery, sortBy]);

  const handleStorePress = useCallback(
    (store: DiscoverStore) => {
      router.push(`/(app)/store/${store.id}`);
    },
    [router]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSortPress = useCallback(() => {
    sortSheetRef.current?.expand();
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
    sortSheetRef.current?.close();
  }, []);

  return (
    <>
      <DiscoverScreen
        stores={filteredAndSortedStores}
        isLoading={isLoading}
        error={error}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortPress={handleSortPress}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onStorePress={handleStorePress}
        onBack={handleBack}
      />

      <BottomSheet ref={sortSheetRef}>
        <DiscoverSortContent value={sortBy} onValueChange={handleSortChange} />
      </BottomSheet>
    </>
  );
}
