import { useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { ChevronDown, Coins, RefreshCw, TrendingUp } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type HowItWorksCardProps = {
  className?: string;
};

const CONCEPTS = [
  {
    icon: Coins,
    title: 'Issue Your Coin',
    description: 'Your USDC revenue automatically issues your stablecoin 1:1. Cash out anytime.',
  },
  {
    icon: RefreshCw,
    title: 'Reward Customers',
    description: 'Send a percentage of issued coins back to customers as cash back.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Value',
    description: 'Issuance decreases over time, rewarding early and loyal customers.',
  },
];

export function HowItWorksCard({ className }: HowItWorksCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useSharedValue(0);

  const toggleExpand = useCallback(() => {
    const newValue = !isExpanded;
    setIsExpanded(newValue);
    animation.value = withTiming(newValue ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [isExpanded, animation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(animation.value, [0, 1], [0, 180])}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: animation.value,
    maxHeight: interpolate(animation.value, [0, 1], [0, 300]),
  }));

  return (
    <View className={cn('rounded-xl border border-border bg-card', className)}>
      <Pressable
        onPress={toggleExpand}
        className="flex-row items-center justify-between p-4 active:opacity-70">
        <View className="flex-1">
          <Text variant="body-emphasis">How Coco Works</Text>
          <Text variant="caption" className="mt-0.5">
            Your store issues its own stablecoin
          </Text>
        </View>
        <Animated.View style={chevronStyle}>
          <Icon as={ChevronDown} size={20} className="text-muted-foreground" />
        </Animated.View>
      </Pressable>

      <Animated.View style={contentStyle} className="overflow-hidden">
        <View className="gap-4 px-4 pb-4">
          {CONCEPTS.map((concept, index) => (
            <View key={index} className="flex-row gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon as={concept.icon} size={18} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text variant="small" className="mb-0.5">
                  {concept.title}
                </Text>
                <Text variant="caption">{concept.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
