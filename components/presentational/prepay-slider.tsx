import { View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Text } from '@/components/ui/text';

type PrepaySliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  minMonths?: number;
  maxMonths?: number;
  className?: string;
};

export function PrepaySlider({
  value,
  onValueChange,
  minMonths = 6,
  maxMonths = 120,
  className = '',
}: PrepaySliderProps) {
  return (
    <View className={className}>
      <Text variant="body" className="mb-1 font-semibold">
        Prepay
      </Text>
      <Text variant="caption" className="mb-4 text-gray-500">
        Pay for loan time upfront to save money.
      </Text>

      <Text variant="body" className="mb-2 text-center font-semibold">
        {value} months
      </Text>

      <Slider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minMonths}
        maximumValue={maxMonths}
        step={1}
        minimumTrackTintColor="#2DD4BF"
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor="#2DD4BF"
      />

      <View className="flex-row justify-between">
        <Text variant="caption" className="text-gray-500">
          {minMonths} months
        </Text>
        <Text variant="caption" className="text-gray-500">
          {maxMonths} months
        </Text>
      </View>
    </View>
  );
}
