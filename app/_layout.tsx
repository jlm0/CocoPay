import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider } from '@/providers/ParaProvider';
import { useLoadFonts } from '@/hooks/useLoadFonts';
import { View } from 'react-native';

const queryClient = new QueryClient();

export default function RootLayout() {
  const fontsLoaded = useLoadFonts();

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
