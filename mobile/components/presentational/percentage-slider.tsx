import { useState, useEffect } from 'react';
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
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSlidingComplete = (newValue: number) => {
    const rounded = Math.round(newValue);
    setLocalValue(rounded);
    onValueChange(rounded);
  };

  return (
    <View className={className}>
      <Text variant="body-emphasis" className="mb-1">
        {label}
      </Text>
      <Text variant="caption" className="mb-4">
        {description}
      </Text>

      <Text variant="body-emphasis" className="mb-2 text-center">
        {Math.round(localValue)}%
      </Text>

      <Slider
        value={localValue}
        onValueChange={setLocalValue}
        onSlidingComplete={handleSlidingComplete}
        minimumValue={minPercent}
        maximumValue={maxPercent}
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
