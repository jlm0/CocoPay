import { View } from 'react-native';
import { Text } from '@/components/ui/text';

type CurrencyDisplayProps = {
  label: string;
  value: string;
  className?: string;
};

export function CurrencyDisplay({ label, value, className = '' }: CurrencyDisplayProps) {
  return (
    <View className={className}>
      <Text variant="caption">{label}</Text>
      <Text variant="heading" className="text-2xl">
        {value}
      </Text>
    </View>
  );
}
