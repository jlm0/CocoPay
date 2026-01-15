import { View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { XCircle } from 'lucide-react-native';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

interface ErrorRetryStateProps {
  title: string;
  message: string;
  onRetry: () => void;
  onBack: () => void;
  retryLabel?: string;
  backLabel?: string;
  header?: React.ReactNode;
}

export function ErrorRetryState({
  title,
  message,
  onRetry,
  onBack,
  retryLabel = 'Try Again',
  backLabel = 'Go Back',
  header,
}: ErrorRetryStateProps) {
  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar showBackButton={false}>
          <Button onPress={onRetry} size="lg" className="h-14 rounded-xl">
            <Text>{retryLabel}</Text>
          </Button>
          <Button variant="ghost" onPress={onBack} className="h-12">
            <Text className="text-muted-foreground">{backLabel}</Text>
          </Button>
        </BottomActionBar>
      }>
      {header}
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Animated.View entering={ZoomIn.springify().damping(12)}>
          <Icon as={XCircle} size={64} className="text-destructive" />
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(150).duration(300)}>
          <Text className="text-center text-lg font-semibold text-destructive">{title}</Text>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(250).duration(300)}>
          <Text className="text-center text-sm text-muted-foreground">{message}</Text>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
