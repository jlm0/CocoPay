import { View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type AccountMenuProps = {
  onLogout: () => void;
  className?: string;
};

export function AccountMenu({ onLogout, className }: AccountMenuProps) {
  return (
    <View className={cn('gap-6', className)}>
      <View className="items-center gap-2">
        <Text className="text-4xl">🥥</Text>
        <Text className="font-sans-semibold text-lg text-foreground">Account</Text>
      </View>

      <Button variant="destructive" onPress={onLogout} className="w-full">
        <Icon as={LogOut} size={18} className="text-destructive-foreground" />
        <Text>Log Out</Text>
      </Button>
    </View>
  );
}
