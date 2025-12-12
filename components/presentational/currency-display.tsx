import { View } from 'react-native';
import { Text } from '@/components/ui/text';

type CurrencyDisplayProps = {
  label: string;
  value: string;
  size?: 'default' | 'large';
  className?: string;
};

export function CurrencyDisplay({
  label,
  value,
  size = 'default',
  className = '',
}: CurrencyDisplayProps) {
  return (
    <View className={className}>
      <Text variant="caption">{label}</Text>
      <Text variant={size === 'large' ? 'display' : 'display-value'}>{value}</Text>
    </View>
  );
}
