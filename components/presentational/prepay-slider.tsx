import { View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Text } from '@/components/ui/text';
import { NATIVE_SLIDER } from '@/lib/theme';

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
      <Text variant="body" className="mb-1 font-sans-semibold">
        Prepay
      </Text>
      <Text variant="caption" className="mb-4">
        Pay for loan time upfront to save money.
      </Text>

      <Text variant="body" className="mb-2 text-center font-sans-semibold">
        {value} months
      </Text>

      <Slider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minMonths}
        maximumValue={maxMonths}
        step={1}
        minimumTrackTintColor={NATIVE_SLIDER.minimumTrackTintColor}
        maximumTrackTintColor={NATIVE_SLIDER.maximumTrackTintColor}
        thumbTintColor={NATIVE_SLIDER.thumbTintColor}
      />

      <View className="flex-row justify-between">
        <Text variant="caption">{minMonths} months</Text>
        <Text variant="caption">{maxMonths} months</Text>
      </View>
    </View>
  );
}
