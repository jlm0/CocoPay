import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalHost } from '@rn-primitives/portal';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import GooglePlacesSdk from 'react-native-google-places-sdk';
import { ParaProvider } from '@/providers/ParaProvider';
import { StoreRegistryHydrator } from '@/providers/StoreRegistryProvider';
import { useLoadFonts } from '@/hooks/useLoadFonts';
import { queryClient, asyncStoragePersister } from '@/lib/query';
import { initializeStoresStorage, initializeStoreRegistry } from '@/lib/storage';
import { initializeAppLifecycle } from '@/lib/lifecycle';
import { View } from 'react-native';

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? '';

export default function RootLayout() {
  const fontsLoaded = useLoadFonts();

  useEffect(() => {
    initializeStoresStorage();
    initializeStoreRegistry();
    const cleanupLifecycle = initializeAppLifecycle();
    if (GOOGLE_PLACES_API_KEY) {
      GooglePlacesSdk.initialize(GOOGLE_PLACES_API_KEY);
    }
    return cleanupLifecycle;
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
          <StoreRegistryHydrator />
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
