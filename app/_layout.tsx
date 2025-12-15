import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider } from '@/providers/ParaProvider';
import { useLoadFonts } from '@/hooks/useLoadFonts';
import { queryClient } from '@/lib/query';
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
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ParaProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
          <PortalHost />
        </ParaProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
