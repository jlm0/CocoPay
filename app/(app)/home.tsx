import { useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { HomeBalances } from '@/components/containers/HomeBalances';
import { HomeStores } from '@/components/containers/HomeStores';
import { PayButton } from '@/components/presentational/pay-button';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { useAccountSheet } from '@/providers/AccountSheetProvider';
import { queryKeys } from '@/lib/query';

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openAccountSheet } = useAccountSheet();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bendystraw.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cocopayRegistry.all });
    }, [queryClient])
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.balance.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bendystraw.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projectMetadata.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.cocopayRegistry.all }),
    ]);
    setIsRefreshing(false);
  }, [queryClient]);

  const handlePayPress = () => {
    router.push('/(app)/pay');
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar showBackButton={false}>
          <PayButton onPress={handlePayPress} />
        </BottomActionBar>
      }>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={['transparent']}
          />
        }>
        <HomeBalances onCoconutPress={openAccountSheet} isRefreshing={isRefreshing} />
        <HomeStores isRefreshing={isRefreshing} />
      </ScrollView>
    </ScreenContainer>
  );
}
