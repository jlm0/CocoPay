import { View } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type PayStoreInfoProps = {
  storeName: string | null;
  storeCode: string;
  onChangeStoreCode: (code: string) => void;
  onEditPress: () => void;
  isEditing: boolean;
  isLoading?: boolean;
  error?: string;
  showEditButton?: boolean;
  disabled?: boolean;
  className?: string;
};

export function PayStoreInfo({
  storeName,
  storeCode,
  onChangeStoreCode,
  onEditPress,
  isEditing,
  isLoading,
  error,
  showEditButton = true,
  disabled = false,
  className = '',
}: PayStoreInfoProps) {
  const showInput = !storeName || isEditing;

  if (isLoading) {
    return (
      <View className={cn('items-center gap-1', className)}>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-20" />
      </View>
    );
  }

  if (showInput) {
    return (
      <View className={cn('items-center', className)}>
        <Input
          value={storeCode}
          onChangeText={onChangeStoreCode}
          placeholder="Store #"
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          className="w-48 text-center"
        />
        {error && (
          <Text variant="small" className="mt-1 text-destructive">
            {error}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className={cn('items-center gap-1', className)}>
      <View className="flex-row items-center gap-2">
        <Text variant="title">{storeName}</Text>
        {showEditButton && (
          <Button
            variant="ghost"
            size="icon"
            onPress={onEditPress}
            disabled={disabled}
            className="h-8 w-8">
            <Icon as={Pencil} size={16} className="text-muted-foreground" />
          </Button>
        )}
      </View>
      <Text variant="caption">{storeCode}</Text>
    </View>
  );
}
