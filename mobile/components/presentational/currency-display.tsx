import { View, StyleSheet, Text as RNText } from 'react-native';
import { AnimatedRollingNumber } from 'react-native-animated-rolling-numbers';
import { Easing } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { shouldUseCompactNotation, CHARACTER_LIMITS } from '@/lib/format';

type CurrencyDisplayProps = {
  label: string;
  value: number;
  size?: 'default' | 'large';
  maxCharacters?: number;
  className?: string;
};

export function CurrencyDisplay({
  label,
  value,
  size = 'default',
  maxCharacters = CHARACTER_LIMITS.HOME_BALANCE,
  className = '',
}: CurrencyDisplayProps) {
  const textStyle = size === 'large' ? styles.displayLarge : styles.displayValue;
  const useCompact = shouldUseCompactNotation(value, maxCharacters);

  return (
    <View className={className}>
      <Text variant="caption">{label}</Text>
      <View style={styles.valueContainer}>
        <RNText style={textStyle}>$</RNText>
        <AnimatedRollingNumber
          value={value}
          useGrouping
          toFixed={2}
          enableCompactNotation={useCompact}
          compactToFixed={2}
          textStyle={textStyle}
          compactNotationStyle={textStyle}
          spinningAnimationConfig={{
            duration: 500,
            easing: Easing.out(Easing.cubic),
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  displayLarge: {
    fontSize: 36,
    lineHeight: 40,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 36 * -0.025,
    color: '#09090b',
  },
  displayValue: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 30 * -0.025,
    color: '#09090b',
  },
});
