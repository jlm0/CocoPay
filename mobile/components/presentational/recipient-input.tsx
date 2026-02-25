import { View, Pressable } from 'react-native';
import { Clipboard, X } from 'lucide-react-native';
import * as ExpoClipboard from 'expo-clipboard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { truncateAddress } from '@/lib/format';
import { cn } from '@/lib/utils';

type RecipientInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  resolvedAddress?: string;
  isResolving?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export function RecipientInput({
  value,
  onChangeText,
  resolvedAddress,
  isResolving = false,
  error,
  disabled = false,
  className = '',
}: RecipientInputProps) {
  const isEnsInput = value.trim().toLowerCase().endsWith('.eth');
  const showResolved = isEnsInput && resolvedAddress && !isResolving;
  const isValidAddress = value.startsWith('0x') && value.length === 42;
  const isValid = (showResolved || isValidAddress) && !error;

  const isEmpty = value.trim().length === 0;

  const handlePaste = async () => {
    const text = await ExpoClipboard.getStringAsync();
    if (text) {
      onChangeText(text.trim());
    }
  };

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View className={className}>
      <Label className="mb-2">Send to</Label>
      <View className="relative">
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder="Address or ENS name"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          className={cn('h-12 pr-12', error && 'border-destructive', isValid && 'border-green-500')}
        />
        <View className="absolute right-3 top-1/2 -translate-y-1/2">
          {isResolving ? (
            <Spinner size="small" />
          ) : isEmpty ? (
            <Pressable
              onPress={handlePaste}
              disabled={disabled}
              hitSlop={8}
              className="active:opacity-50">
              <Icon as={Clipboard} size={18} className="text-muted-foreground" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleClear}
              disabled={disabled}
              hitSlop={8}
              className="active:opacity-50">
              <Icon as={X} size={18} className="text-muted-foreground" />
            </Pressable>
          )}
        </View>
      </View>
      {error && (
        <Text variant="small" className="mt-1.5 text-destructive">
          {error}
        </Text>
      )}
      {showResolved && (
        <View className="mt-1.5 flex-row items-center gap-1">
          <Text variant="small" className="text-green-600">
            Resolves to {truncateAddress(resolvedAddress)}
          </Text>
        </View>
      )}
    </View>
  );
}
