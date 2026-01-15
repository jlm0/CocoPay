import Animated, { FadeIn } from 'react-native-reanimated';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';

interface LoadingRetryStateProps {
  title: string;
  message: string;
}

export function LoadingRetryState({ title, message }: LoadingRetryStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="flex-1 items-center justify-center gap-4 px-6">
      <Spinner size="large" />
      <Text className="text-muted-foreground">{title}</Text>
      <Text className="text-center text-sm text-muted-foreground">{message}</Text>
    </Animated.View>
  );
}
