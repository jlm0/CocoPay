import { useState, useRef } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import { HomeStoreCard } from './home-store-card';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import type { Store } from '@/types';

type HomeStoreGridProps = {
  stores: Store[];
  onStorePress: (store: Store) => void;
  initialCount?: number;
  incrementCount?: number;
  maxHeight?: number;
};

const STAGGER_DELAY_MS = 50;

export function HomeStoreGrid({
  stores,
  onStorePress,
  initialCount = 4,
  incrementCount = 4,
  maxHeight = 400,
}: HomeStoreGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const previousVisibleCount = useRef(initialCount);

  const hasMore = stores.length > visibleCount;
  const visibleStores = stores.slice(0, visibleCount);

  const handleViewMore = () => {
    previousVisibleCount.current = visibleCount;
    setVisibleCount((prev) => Math.min(prev + incrementCount, stores.length));
  };

  const rows: Store[][] = [];
  for (let i = 0; i < visibleStores.length; i += 2) {
    rows.push(visibleStores.slice(i, i + 2));
  }

  return (
    <View className="flex-1">
      <ScrollView
        style={{ maxHeight }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{ gap: 12 }}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} className="flex-row gap-3">
            {row.map((store, colIndex) => {
              const itemIndex = rowIndex * 2 + colIndex;
              const isNewlyRevealed = itemIndex >= previousVisibleCount.current;
              const animationIndex = itemIndex - previousVisibleCount.current;

              return (
                <Animated.View
                  key={store.id}
                  className="flex-1"
                  entering={
                    isNewlyRevealed
                      ? FadeInDown.delay(animationIndex * STAGGER_DELAY_MS).duration(300)
                      : undefined
                  }>
                  <HomeStoreCard store={store} onPress={() => onStorePress(store)} />
                </Animated.View>
              );
            })}
            {row.length === 1 && <View className="flex-1" />}
          </View>
        ))}

        {hasMore && (
          <Pressable
            onPress={handleViewMore}
            className="flex-row items-center justify-center gap-1 rounded-xl py-2 active:bg-muted">
            <Text className="font-sans-medium text-sm text-muted-foreground">View more</Text>
            <Icon as={ChevronDown} size={16} className="text-muted-foreground" />
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
