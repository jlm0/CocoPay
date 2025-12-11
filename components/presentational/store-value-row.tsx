import { View } from 'react-native';
import { Text } from '@/components/ui/text';

type ValueItem = {
  label: string;
  value: number;
};

type StoreValueRowProps = {
  values: ValueItem[];
  className?: string;
};

export function StoreValueRow({ values, className = '' }: StoreValueRowProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <View className={`flex-row justify-between ${className}`}>
      {values.map((item) => (
        <View key={item.label} className="flex-1">
          <Text variant="caption">{item.label}</Text>
          <Text variant="body" className="font-sans-semibold">
            {formatCurrency(item.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}
