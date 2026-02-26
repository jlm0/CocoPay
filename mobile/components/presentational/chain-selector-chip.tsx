import { View, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { getChainColor, getChainColorMuted } from '@/lib/chain-ui';
import { CHAIN_NAMES, type SupportedChainId } from '@/lib/constants';
import { cn } from '@/lib/utils';

type ChainSelectorChipProps = {
  chainId: SupportedChainId;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
};

export function ChainSelectorChip({
  chainId,
  onPress,
  disabled,
  className,
}: ChainSelectorChipProps) {
  const chainName = CHAIN_NAMES[chainId];
  const chainColor = getChainColor(chainId);
  const chainColorMuted = getChainColorMuted(chainId);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'flex-row items-center gap-2 self-center rounded-full px-3 py-2 active:opacity-70',
        disabled && 'opacity-50',
        className
      )}
      style={{ backgroundColor: chainColorMuted }}>
      <View className="size-3 rounded-full" style={{ backgroundColor: chainColor }} />
      <Text className="font-mono">{chainName}</Text>
      <Icon as={ChevronDown} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}
