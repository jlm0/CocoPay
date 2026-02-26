import { View } from 'react-native';
import { ArrowUpDown } from 'lucide-react-native';
import { FeatureHeader } from './feature-header';
import { DiscoverSearchBar } from './discover-search-bar';
import { DiscoverStoreList } from './discover-store-list';
import { DiscoverMapView } from './discover-map-view';
import { DiscoverViewToggle } from './discover-view-toggle';
import { DiscoverEmptyState } from './discover-empty-state';
import { StoreFloatingCard } from './store-floating-card';
import { BottomActionBar } from './bottom-action-bar';
import { ScreenContainer } from './screen-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import type { DiscoverStore, SortOption, ViewMode } from '@/types';

type DiscoverScreenProps = {
  stores: DiscoverStore[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortPress: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onStorePress: (store: DiscoverStore) => void;
  onBack: () => void;
  selectedStore: DiscoverStore | null;
  onMarkerPress: (store: DiscoverStore) => void;
  onViewStore: () => void;
  focusedStoreId?: string;
};

const SORT_LABELS: Record<SortOption, string> = {
  name: 'Name',
  cashback: 'Cashback',
};

function DiscoverSkeleton() {
  return (
    <View className="gap-3">
      {[0, 1, 2, 3].map((i) => (
        <View key={i} className="border-2 border-border p-4">
          <View className="flex-row items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-16" />
          </View>
          <View className="mt-2 flex-row items-center gap-1">
            <Skeleton className="h-4 w-48" />
          </View>
          <View className="mt-3 flex-row gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function DiscoverScreen({
  stores,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortPress,
  viewMode,
  onViewModeChange,
  onStorePress,
  onBack,
  selectedStore,
  onMarkerPress,
  onViewStore,
  focusedStoreId,
}: DiscoverScreenProps) {
  const hasStores = stores.length > 0;
  const showEmptySearch = !isLoading && !hasStores && searchQuery.length > 0;
  const showEmptyState = !isLoading && !hasStores && searchQuery.length === 0;

  return (
    <ScreenContainer>
      <View className="flex-1">
        <FeatureHeader title="Discover" subtitle="Find stores near you" className="mb-4" />

        <View className="mb-4 flex-row items-center gap-3">
          <View className="flex-1">
            <DiscoverSearchBar value={searchQuery} onChangeText={onSearchChange} />
          </View>
          {viewMode === 'list' && (
            <Button variant="outline" size="sm" onPress={onSortPress} className="flex-row gap-1">
              <Icon as={ArrowUpDown} size={16} className="text-foreground" />
              <Text variant="caption">{SORT_LABELS[sortBy]}</Text>
            </Button>
          )}
        </View>

        {isLoading ? (
          <DiscoverSkeleton />
        ) : error ? (
          <DiscoverEmptyState type="no-stores" />
        ) : showEmptySearch ? (
          <DiscoverEmptyState type="no-results" searchQuery={searchQuery} />
        ) : showEmptyState ? (
          <DiscoverEmptyState type="no-stores" />
        ) : viewMode === 'list' ? (
          <DiscoverStoreList stores={stores} onStorePress={onStorePress} />
        ) : (
          <DiscoverMapView
            stores={stores}
            onMarkerPress={onMarkerPress}
            focusedStoreId={focusedStoreId}
          />
        )}

        {viewMode === 'map' && selectedStore && (
          <StoreFloatingCard store={selectedStore} onPress={onViewStore} />
        )}

        <DiscoverViewToggle value={viewMode} onValueChange={onViewModeChange} />
      </View>

      <BottomActionBar onBack={onBack} />
    </ScreenContainer>
  );
}
