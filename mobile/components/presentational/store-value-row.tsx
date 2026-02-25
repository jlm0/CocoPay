import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { getFormattedCurrencyPreview, CHARACTER_LIMITS } from '@/lib/format';

type ValueItem = {
  label: string;
  value: number;
  comingSoon?: boolean;
};

type StoreValueRowProps = {
  values: ValueItem[];
  className?: string;
};

export function StoreValueRow({ values, className = '' }: StoreValueRowProps) {
  return (
    <View className={`flex-row justify-between ${className}`}>
      {values.map((item) => (
        <View key={item.label} className="flex-1">
          <Text variant="caption">{item.label}</Text>
          <Text variant="body-emphasis" className={item.comingSoon ? 'text-muted-foreground' : ''}>
            {item.comingSoon
              ? 'Coming soon'
              : getFormattedCurrencyPreview(item.value, CHARACTER_LIMITS.STORE_VALUE)}
          </Text>
        </View>
      ))}
    </View>
  );
}
