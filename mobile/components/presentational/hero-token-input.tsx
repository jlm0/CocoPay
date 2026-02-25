import { View, Pressable } from 'react-native';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type HeroTokenInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  tokenSymbol: string;
  balance?: number;
  onMaxPress?: () => void;
  isLoading?: boolean;
  error?: string;
  estimate?: string;
  estimateLoading?: boolean;
  disabled?: boolean;
  showBalance?: boolean;
  className?: string;
};

export function HeroTokenInput({
  value,
  onChangeText,
  tokenSymbol,
  balance,
  onMaxPress,
  isLoading,
  error,
  estimate,
  estimateLoading,
  disabled = false,
  showBalance = true,
  className = '',
}: HeroTokenInputProps) {
  const hasValue = value.length > 0 && value !== '0';

  const formatBalance = (val: number) => {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const handleChangeText = (text: string) => {
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : filtered;
    onChangeText(sanitized);
  };

  return (
    <View className={cn('items-center py-8', className)}>
      <View className="flex-row items-baseline justify-center">
        <Input
          value={value}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          placeholder="0"
          textAlignVertical="center"
          editable={!disabled}
          className={cn(
            'h-16 min-w-16 border-0 bg-transparent px-0 py-0 text-center font-sans-bold text-5xl leading-tight shadow-none',
            !hasValue && 'text-muted-foreground/30'
          )}
          style={{ width: Math.max(64, value.length * 28 + 16) }}
        />
        <Text className="ml-2 font-sans-semibold text-xl text-muted-foreground">{tokenSymbol}</Text>
      </View>

      {showBalance && (
        <View className="mt-4 flex-row items-center gap-3">
          {isLoading ? (
            <Skeleton className="h-5 w-32 rounded" />
          ) : (
            <Text variant="caption">
              Balance: {formatBalance(balance ?? 0)} {tokenSymbol}
            </Text>
          )}

          {onMaxPress && (
            <Pressable
              onPress={onMaxPress}
              disabled={disabled}
              className={cn(
                'rounded-lg bg-secondary px-3 py-1.5 active:bg-secondary/60',
                disabled && 'opacity-50'
              )}>
              <Text variant="caption" className="font-sans-semibold text-secondary-foreground">
                Max
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {error && (
        <Text variant="small" className="mt-2 text-destructive">
          {error}
        </Text>
      )}

      {(estimate || estimateLoading) && (
        <View className="mt-4">
          {estimateLoading ? (
            <Skeleton className="h-5 w-40 rounded" />
          ) : (
            <Text variant="body" className="text-center text-muted-foreground">
              {estimate}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
