import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

type ScreenContainerProps = {
  children: React.ReactNode;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  horizontalPadding?: boolean;
  bottomActionBar?: React.ReactNode;
};

const HORIZONTAL_PADDING = 24;

export function ScreenContainer({
  children,
  className,
  edges = ['top', 'bottom'],
  horizontalPadding = true,
  bottomActionBar,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  const hPadding = horizontalPadding ? HORIZONTAL_PADDING : 0;

  const effectiveEdges = bottomActionBar ? edges.filter((edge) => edge !== 'bottom') : edges;

  const safeAreaStyle = {
    paddingTop: effectiveEdges.includes('top') ? insets.top : 0,
    paddingBottom: effectiveEdges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: effectiveEdges.includes('left') ? insets.left : hPadding,
    paddingRight: effectiveEdges.includes('right') ? insets.right : hPadding,
  };

  return (
    <View style={safeAreaStyle} className={cn('flex-1 bg-background', className)}>
      {children}
      {bottomActionBar}
    </View>
  );
}
