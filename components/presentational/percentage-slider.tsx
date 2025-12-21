import { View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Text } from '@/components/ui/text';
import { NATIVE_SLIDER } from '@/lib/theme';

type PercentageSliderProps = {
  label: string;
  description: string;
  value: number;
  onValueChange: (value: number) => void;
  minPercent?: number;
  maxPercent?: number;
  disabled?: boolean;
  className?: string;
};

export function PercentageSlider({
  label,
  description,
  value,
  onValueChange,
  minPercent = 0,
  maxPercent = 10,
  disabled,
  className = '',
}: PercentageSliderProps) {
  return (
    <View className={className}>
      <Text variant="body-emphasis" className="mb-1">
        {label}
      </Text>
      <Text variant="caption" className="mb-4">
        {description}
      </Text>

      <Text variant="body-emphasis" className="mb-2 text-center">
        {value}%
      </Text>

      <Slider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minPercent}
        maximumValue={maxPercent}
        step={1}
        disabled={disabled}
        minimumTrackTintColor={NATIVE_SLIDER.minimumTrackTintColor}
        maximumTrackTintColor={NATIVE_SLIDER.maximumTrackTintColor}
        thumbTintColor={NATIVE_SLIDER.thumbTintColor}
      />

      <View className="flex-row justify-between">
        <Text variant="caption">{minPercent}%</Text>
        <Text variant="caption">{maxPercent}%</Text>
      </View>
    </View>
  );
}
