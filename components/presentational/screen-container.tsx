import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

type ScreenContainerProps = {
  children: React.ReactNode;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  horizontalPadding?: boolean;
};

const HORIZONTAL_PADDING = 24;

export function ScreenContainer({
  children,
  className,
  edges = ['top', 'bottom'],
  horizontalPadding = true,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  const hPadding = horizontalPadding ? HORIZONTAL_PADDING : 0;

  const safeAreaStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : hPadding,
    paddingRight: edges.includes('right') ? insets.right : hPadding,
  };

  return (
    <View style={safeAreaStyle} className={cn('flex-1 bg-background', className)}>
      {children}
    </View>
  );
}
