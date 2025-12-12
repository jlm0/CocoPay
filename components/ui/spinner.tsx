import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';
import { HEX_COLORS } from '@/lib/theme';

type SpinnerProps = Omit<ActivityIndicatorProps, 'color'> & {
  color?: string;
};

export function Spinner({ color = HEX_COLORS.primary, ...props }: SpinnerProps) {
  return <ActivityIndicator color={color} {...props} />;
}
