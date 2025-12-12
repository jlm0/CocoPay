import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ScreenContainer } from '@/components/presentational/screen-container';

function useEntryAnimation() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return { opacity, translateY };
}

function useStaggeredAnimation(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, [opacity, translateY, delay]);

  return { opacity, translateY };
}

function AccentLine() {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(width, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }).start();
    }, 200);

    return () => clearTimeout(timeout);
  }, [width]);

  return (
    <View className="mt-3 h-0.5 w-24 overflow-hidden rounded-full bg-muted">
      <Animated.View
        className="h-full bg-primary"
        style={{
          width: width.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
    </View>
  );
}

export default function WelcomePage() {
  const router = useRouter();

  const brandAnim = useEntryAnimation();
  const valueAnim = useStaggeredAnimation(80);
  const buttonAnim = useStaggeredAnimation(160);

  const handleGetStarted = () => {
    router.push('/auth');
  };

  return (
    <ScreenContainer>
      <LinearGradient
        colors={['hsla(168, 76%, 50%, 0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        className="absolute inset-0"
      />

      <View className="flex-[0.35]" />

      <Animated.View
        className="items-center"
        style={{
          opacity: brandAnim.opacity,
          transform: [{ translateY: brandAnim.translateY }],
        }}>
        <Text variant="display" className="text-center">
          CocoPay 🥥
        </Text>
        <AccentLine />
      </Animated.View>

      <View className="flex-[0.15]" />

      <Animated.View
        className="items-center gap-2"
        style={{
          opacity: valueAnim.opacity,
          transform: [{ translateY: valueAnim.translateY }],
        }}>
        <Text variant="heading" className="text-center">
          Payments that reward you
        </Text>
        <Text variant="body" className="text-center text-muted-foreground">
          Built on Juicebox Protocol
        </Text>
      </Animated.View>

      <View className="flex-1" />

      <Animated.View
        className="gap-3"
        style={{
          opacity: buttonAnim.opacity,
          transform: [{ translateY: buttonAnim.translateY }],
        }}>
        <Button onPress={handleGetStarted} size="lg" className="h-14 rounded-xl">
          <Text>Get started</Text>
        </Button>
      </Animated.View>
    </ScreenContainer>
  );
}
