import { Stack } from 'expo-router';
import { StoreCreationProvider } from '@/lib/contexts/store-creation-context';

export default function CreateLayout() {
  return (
    <StoreCreationProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="status" options={{ gestureEnabled: false }} />
      </Stack>
    </StoreCreationProvider>
  );
}
