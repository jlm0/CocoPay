import { View } from 'react-native';
import { MoreVertical, Pencil, RefreshCw } from 'lucide-react-native';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';

type StoreOptionsMenuProps = {
  onEditPress: () => void;
  onReattemptPress?: () => void;
  failedChainCount?: number;
};

export function StoreOptionsMenu({
  onEditPress,
  onReattemptPress,
  failedChainCount,
}: StoreOptionsMenuProps) {
  const showReattempt = onReattemptPress && failedChainCount && failedChainCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <View className="active:opacity-70" hitSlop={12}>
          <Icon as={MoreVertical} className="size-6 text-foreground" />
        </View>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-52">
        <DropdownMenuItem onPress={onEditPress} className="gap-3">
          <Icon as={Pencil} className="size-4 text-muted-foreground" />
          <Text className="text-foreground">Edit store</Text>
        </DropdownMenuItem>

        {showReattempt && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onPress={onReattemptPress} className="gap-3">
              <Icon as={RefreshCw} className="size-4 text-muted-foreground" />
              <View className="flex-1 flex-row items-center justify-between">
                <Text className="text-foreground">Retry chains</Text>
                <Badge variant="secondary" className="ml-2">
                  <Text className="text-xs">{failedChainCount}</Text>
                </Badge>
              </View>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
