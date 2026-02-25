import { useCallback } from 'react';
import { View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { usePara } from '@/providers/ParaProvider';

export function SettingsContainer() {
  const { logout } = usePara();

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <ScreenContainer bottomActionBar={<BottomActionBar />}>
      <Text variant="title" className="mb-6">
        Settings
      </Text>

      <View className="flex-1" />

      <Button variant="destructive" onPress={handleLogout} className="mb-32 w-full">
        <Icon as={LogOut} size={18} className="text-destructive-foreground" />
        <Text>Log Out</Text>
      </Button>
    </ScreenContainer>
  );
}
