import { Stack } from 'expo-router';
import { AccountSheetProvider } from '@/providers/AccountSheetProvider';

export default function AppLayout() {
  return (
    <AccountSheetProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AccountSheetProvider>
  );
}
