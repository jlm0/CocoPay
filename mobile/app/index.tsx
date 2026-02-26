import { useEffect, useRef } from 'react';
import { View, Animated, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { HEX_COLORS } from '@/lib/theme';

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

function GradientWaveTop() {
  const { width } = useWindowDimensions();
  const height = 320;

  return (
    <View className="absolute left-0 right-0 top-0" style={{ height }}>
      <LinearGradient
        colors={['rgba(186, 255, 41, 0.18)', 'rgba(186, 255, 41, 0.10)', 'transparent']}
        locations={[0, 0.5, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="absolute bottom-0 left-0 right-0">
        <Svg width={width} height={80} viewBox={`0 0 ${width} 80`}>
          <Path
            d={`M0,50 Q${width * 0.25},65 ${width * 0.5},50 T${width},50 L${width},80 L0,80 Z`}
            fill={HEX_COLORS.background}
          />
        </Svg>
      </View>
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
      <GradientWaveTop />

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
        style={{
          opacity: buttonAnim.opacity,
          transform: [{ translateY: buttonAnim.translateY }],
        }}>
        <Button onPress={handleGetStarted} size="lg" className="h-14 rounded-2xl">
          <Text className="font-brutal">Get started</Text>
        </Button>
      </Animated.View>
    </ScreenContainer>
  );
}
