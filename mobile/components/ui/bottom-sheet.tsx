import { forwardRef, useCallback, useMemo } from 'react';
import { useColorScheme, View } from 'react-native';
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import type { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { COLORS } from '@/lib/theme';
import { cn } from '@/lib/utils';

type BottomSheetProps = {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
  onClose?: () => void;
  className?: string;
};

const BottomSheet = forwardRef<BottomSheetMethods, BottomSheetProps>(
  ({ children, snapPoints, enableDynamicSizing = true, onClose, className }, ref) => {
    const colorScheme = useColorScheme();
    const theme = COLORS[colorScheme ?? 'dark'];
    const defaultSnapPoints = useMemo(() => snapPoints ?? ['25%'], [snapPoints]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      []
    );

    return (
      <GorhomBottomSheet
        ref={ref}
        index={-1}
        snapPoints={enableDynamicSizing ? undefined : defaultSnapPoints}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={onClose}
        backgroundStyle={{
          backgroundColor: theme.card,
          borderRadius: 0,
          borderTopWidth: 2,
          borderTopColor: theme.foreground,
        }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}>
        <BottomSheetView>
          <View className={cn('px-6 pb-8', className)}>{children}</View>
        </BottomSheetView>
      </GorhomBottomSheet>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

export { BottomSheet };
export type { BottomSheetMethods };
