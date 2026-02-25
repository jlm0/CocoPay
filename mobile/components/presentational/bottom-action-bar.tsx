import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { HEX_COLORS } from '@/lib/theme';
import { cn } from '@/lib/utils';

type BottomActionBarProps = {
  children?: React.ReactNode;
  onBack?: () => void;
  showBackButton?: boolean;
  disabled?: boolean;
  className?: string;
};

const GRADIENT_HEIGHT = 32;
const HORIZONTAL_PADDING = 24;

export function BottomActionBar({
  children,
  onBack,
  showBackButton = true,
  disabled = false,
  className,
}: BottomActionBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className={cn('absolute bottom-0 left-0 right-0', className)}>
      <LinearGradient
        colors={['rgba(255,255,255,0)', HEX_COLORS.background]}
        style={{ height: GRADIENT_HEIGHT }}
        pointerEvents="none"
      />
      <View
        className="bg-background"
        style={{
          paddingBottom: insets.bottom,
          paddingHorizontal: HORIZONTAL_PADDING,
        }}>
        <View className="gap-3 pb-2">
          {children}
          {showBackButton && (
            <Button
              variant="ghost"
              className="h-12 w-full"
              onPress={handleBack}
              disabled={disabled}>
              <Icon
                as={ChevronDown}
                size={32}
                className={disabled ? 'text-muted-foreground' : 'text-primary'}
              />
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}
