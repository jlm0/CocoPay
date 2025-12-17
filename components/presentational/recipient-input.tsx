import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { truncateAddress } from '@/lib/format';

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

  return (
    <View className={className}>
      <Label className="mb-2 font-sans-semibold">Recipient</Label>
      <View className="relative">
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder="Address or ENS"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          className={error ? 'border-destructive' : ''}
        />
        {isResolving && (
          <View className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="small" />
          </View>
        )}
      </View>
      {error && (
        <Text variant="small" className="mt-1 text-destructive">
          {error}
        </Text>
      )}
      {showResolved && (
        <Text variant="small" className="mt-1 text-muted-foreground">
          Resolves to {truncateAddress(resolvedAddress)}
        </Text>
      )}
    </View>
  );
}
