import { View, StyleSheet, Text as RNText } from 'react-native';
import { AnimatedRollingNumber } from 'react-native-animated-rolling-numbers';
import { Easing } from 'react-native-reanimated';
import { shouldUseCompactNotation } from '@/lib/format';

type HeroBalanceProps = {
  value: number;
  className?: string;
  animated?: boolean;
};

const HERO_CHARACTER_LIMIT = 12;

export function HeroBalance({ value, className = '', animated = true }: HeroBalanceProps) {
  const useCompact = shouldUseCompactNotation(value, HERO_CHARACTER_LIMIT);

  return (
    <View className={className}>
      <View style={styles.container}>
        <RNText style={styles.hero}>$</RNText>
        <AnimatedRollingNumber
          value={value}
          useGrouping
          toFixed={2}
          enableCompactNotation={useCompact}
          compactToFixed={2}
          textStyle={styles.hero}
          compactNotationStyle={styles.hero}
          spinningAnimationConfig={{
            duration: animated ? 500 : 0,
            easing: Easing.out(Easing.cubic),
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  hero: {
    fontSize: 48,
    lineHeight: 52,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 48 * -0.025,
    color: '#09090b',
  },
});
