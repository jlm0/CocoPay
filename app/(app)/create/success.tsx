import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function StoreSuccessPage() {
  const router = useRouter();
  const { name, storeId } = useLocalSearchParams<{
    name: string;
    storeId: string;
  }>();

  const handleViewStore = () => {
    router.replace(`/store/${storeId}` as const);
  };

  const handleGoHome = () => {
    router.replace('/(app)/home');
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar showBackButton={false}>
          <Button onPress={handleViewStore} size="lg" className="h-14 rounded-xl">
            <Text>View Store</Text>
          </Button>
          <Button variant="ghost" onPress={handleGoHome} className="h-12">
            <Text className="text-muted-foreground">Go to Home</Text>
          </Button>
        </BottomActionBar>
      }>
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View entering={FadeIn.delay(100).duration(400)} className="mb-6">
          <Text className="text-6xl">🥥</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)} className="mb-2">
          <Text variant="title" className="text-center">
            Store Created
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)} className="mb-10">
          <Text variant="caption" className="text-center">
            Your store is ready to accept payments
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          className="w-full rounded-2xl bg-muted p-6">
          <Text variant="label" className="mb-1 text-center">
            Store Name
          </Text>
          <Text variant="heading" className="text-center">
            {name}
          </Text>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
