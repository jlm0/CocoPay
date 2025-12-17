import { useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { HomeBalances } from '@/components/containers/HomeBalances';
import { HomeStores } from '@/components/containers/HomeStores';
import { PayButton } from '@/components/presentational/pay-button';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { useAccountSheet } from '@/providers/AccountSheetProvider';
import { HEX_COLORS } from '@/lib/theme';

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openAccountSheet } = useAccountSheet();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['token-balances'] }),
      queryClient.invalidateQueries({ queryKey: ['bendystraw'] }),
      queryClient.invalidateQueries({ queryKey: ['project-metadata'] }),
      queryClient.invalidateQueries({ queryKey: ['cocopay-registry'] }),
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
            tintColor={HEX_COLORS.primary}
            colors={[HEX_COLORS.primary]}
          />
        }>
        <HomeBalances onCoconutPress={openAccountSheet} />
        <HomeStores />
      </ScrollView>
    </ScreenContainer>
  );
}
