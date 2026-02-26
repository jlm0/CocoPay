import { View, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { getChainColor, getChainColorMuted } from '@/lib/chain-ui';
import { CHAIN_NAMES, type SupportedChainId } from '@/lib/constants';
import { cn } from '@/lib/utils';

type ChainOptionCardProps = {
  chainId: SupportedChainId;
  balance: bigint;
  formatted: string;
  isExpanded: boolean;
  onPress: () => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onMaxPress: () => void;
  onAddPress: () => void;
  disabled?: boolean;
  className?: string;
};

export function ChainOptionCard({
  chainId,
  formatted,
  isExpanded,
  onPress,
  inputValue,
  onInputChange,
  onMaxPress,
  onAddPress,
  disabled,
  className,
}: ChainOptionCardProps) {
  const chainName = CHAIN_NAMES[chainId];
  const chainColor = getChainColor(chainId);
  const chainColorMuted = getChainColorMuted(chainId);

  const formattedBalance = parseFloat(formatted).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleChangeText = (text: string) => {
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : filtered;
    onInputChange(sanitized);
  };

  const hasAmount = inputValue.length > 0 && inputValue !== '0' && parseFloat(inputValue) > 0;

  return (
    <View
      className={cn('overflow-hidden border border-border bg-card', className)}
      style={{ borderLeftColor: chainColor, borderLeftWidth: 3 }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={cn('p-4 active:opacity-70', disabled && 'opacity-50')}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View
              className="size-10 items-center justify-center"
              style={{ backgroundColor: chainColorMuted }}>
              <View className="size-4" style={{ backgroundColor: chainColor }} />
            </View>
            <Text className="font-brutal uppercase">{chainName}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text variant="caption">${formattedBalance}</Text>
            <Icon
              as={ChevronDown}
              size={16}
              className={cn(
                'text-muted-foreground transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </View>
        </View>
      </Pressable>

      {isExpanded && (
        <View className="border-t border-border px-4 pb-4 pt-3">
          <View className="flex-row items-center justify-between">
            <Text variant="caption">${formattedBalance} available</Text>
            <Pressable onPress={onMaxPress} disabled={disabled} className="active:opacity-70">
              <Text variant="caption" className="font-brutal uppercase text-primary">
                Max
              </Text>
            </Pressable>
          </View>

          <View className="mt-3 flex-row gap-2">
            <View className="flex-1">
              <Input
                value={inputValue}
                onChangeText={handleChangeText}
                keyboardType="decimal-pad"
                placeholder="0.00"
                editable={!disabled}
                className="h-12"
              />
            </View>
            <Button onPress={onAddPress} disabled={disabled || !hasAmount} className="h-12 px-4">
              <Text>Add</Text>
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
