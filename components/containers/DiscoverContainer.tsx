import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DiscoverScreen } from '@/components/presentational/discover-screen';
import { DiscoverSortContent } from '@/components/presentational/discover-sort-content';
import { BottomSheet, type BottomSheetMethods } from '@/components/ui/bottom-sheet';
import { useDiscoverStores } from '@/hooks/useDiscoverStores';
import type { DiscoverStore, SortOption, ViewMode } from '@/types';

type SelectedStore = DiscoverStore | null;

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
  const { viewMode: initialViewMode, storeId: focusStoreId } = useLocalSearchParams<{
    viewMode?: string;
    storeId?: string;
  }>();

  const sortSheetRef = useRef<BottomSheetMethods>(null);
  const storeSheetRef = useRef<BottomSheetMethods>(null);

  const { stores: rawStores, isLoading, error } = useDiscoverStores();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode === 'map' ? 'map' : 'list');
  const [selectedStore, setSelectedStore] = useState<SelectedStore>(null);

  useEffect(() => {
    if (focusStoreId && rawStores.length > 0 && !selectedStore) {
      const store = rawStores.find((s) => s.id === focusStoreId);
      if (store) {
        setSelectedStore(store);
        storeSheetRef.current?.expand();
      }
    }
  }, [focusStoreId, rawStores, selectedStore]);

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

  const handleMarkerPress = useCallback((store: DiscoverStore) => {
    setSelectedStore(store);
    storeSheetRef.current?.expand();
  }, []);

  const handleViewStore = useCallback(() => {
    if (selectedStore) {
      router.push(`/(app)/store/${selectedStore.id}?source=discover-map`);
    }
  }, [selectedStore, router]);

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
        selectedStore={selectedStore}
        onMarkerPress={handleMarkerPress}
        onViewStore={handleViewStore}
        storeSheetRef={storeSheetRef}
        focusedStoreId={focusStoreId}
      />

      <BottomSheet ref={sortSheetRef}>
        <DiscoverSortContent value={sortBy} onValueChange={handleSortChange} />
      </BottomSheet>
    </>
  );
}
