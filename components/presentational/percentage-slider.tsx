import { View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Text } from '@/components/ui/text';

type PercentageSliderProps = {
  label: string;
  description: string;
  value: number;
  onValueChange: (value: number) => void;
  minPercent?: number;
  maxPercent?: number;
  className?: string;
};

export function PercentageSlider({
  label,
  description,
  value,
  onValueChange,
  minPercent = 0,
  maxPercent = 10,
  className = '',
}: PercentageSliderProps) {
  return (
    <View className={className}>
      <Text variant="body" className="mb-1 font-semibold">
        {label}
      </Text>
      <Text variant="caption" className="mb-4 text-gray-500">
        {description}
      </Text>

      <Text variant="body" className="mb-2 text-center font-semibold">
        {value}%
      </Text>

      <Slider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minPercent}
        maximumValue={maxPercent}
        step={1}
        minimumTrackTintColor="#2DD4BF"
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor="#2DD4BF"
      />

      <View className="flex-row justify-between">
        <Text variant="caption" className="text-gray-500">
          {minPercent}%
        </Text>
        <Text variant="caption" className="text-gray-500">
          {maxPercent}%
        </Text>
      </View>
    </View>
  );
}
