import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalHost } from '@rn-primitives/portal';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ParaProvider } from '@/providers/ParaProvider';
import { useLoadFonts } from '@/hooks/useLoadFonts';
import { queryClient, asyncStoragePersister } from '@/lib/query';
import { initializeStoresStorage } from '@/lib/storage';
import { View } from 'react-native';

export default function RootLayout() {
  const fontsLoaded = useLoadFonts();

  useEffect(() => {
    initializeStoresStorage();
  }, []);

  if (!fontsLoaded) {
    return <View className="flex-1 bg-background" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}>
          <ParaProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
            <PortalHost />
          </ParaProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
