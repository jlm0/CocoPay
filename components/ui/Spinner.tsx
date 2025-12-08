import { ActivityIndicator, View, type ActivityIndicatorProps } from 'react-native';

interface SpinnerProps extends Omit<ActivityIndicatorProps, 'size'> {
  size?: 'small' | 'large';
  className?: string;
}

export function Spinner({
  size = 'large',
  color = '#4F46E5',
  className = '',
  ...props
}: SpinnerProps) {
  return (
    <View className={`items-center justify-center ${className}`}>
      <ActivityIndicator size={size} color={color} {...props} />
    </View>
  );
}
