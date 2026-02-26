import { useState, useEffect } from 'react';
import { View, StyleSheet, Text as RNText, useColorScheme } from 'react-native';
import { AnimatedRollingNumber } from 'react-native-animated-rolling-numbers';
import { Easing } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { shouldUseCompactNotation, CHARACTER_LIMITS } from '@/lib/format';
import { COLORS } from '@/lib/theme';

const ANIMATION_DELAY_MS = 350;

type BalanceDisplayProps = {
  amount: number;
  tokenSymbol: string;
  usdValue?: number;
  maxCharacters?: number;
  animationDelay?: number;
  className?: string;
};

export function BalanceDisplay({
  amount,
  tokenSymbol,
  usdValue,
  maxCharacters = CHARACTER_LIMITS.TOKEN_DETAIL,
  animationDelay = ANIMATION_DELAY_MS,
  className = '',
}: BalanceDisplayProps) {
  const colorScheme = useColorScheme();
  const [displayAmount, setDisplayAmount] = useState(0);
  const [displayUsdValue, setDisplayUsdValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayAmount(amount);
      setDisplayUsdValue(usdValue ?? 0);
    }, animationDelay);

    return () => clearTimeout(timeout);
  }, [amount, usdValue, animationDelay]);

  const useCompact = usdValue !== undefined && shouldUseCompactNotation(usdValue, maxCharacters);
  const displayStyle = { ...styles.display, color: COLORS[colorScheme ?? 'dark'].foreground };
  const bodyStyle = { ...styles.body, color: COLORS[colorScheme ?? 'dark'].mutedForeground };

  return (
    <View className={className}>
      <Text variant="caption">Balance</Text>
      {usdValue !== undefined && (
        <View style={styles.usdContainer}>
          <RNText style={displayStyle}>$</RNText>
          <AnimatedRollingNumber
            value={displayUsdValue}
            useGrouping
            toFixed={2}
            enableCompactNotation={useCompact}
            compactToFixed={2}
            textStyle={displayStyle}
            compactNotationStyle={displayStyle}
            spinningAnimationConfig={{
              duration: 500,
              easing: Easing.out(Easing.cubic),
            }}
          />
        </View>
      )}
      <View style={styles.tokenContainer}>
        <AnimatedRollingNumber
          value={displayAmount}
          useGrouping
          toFixed={6}
          textStyle={bodyStyle}
          spinningAnimationConfig={{
            duration: 500,
            easing: Easing.out(Easing.cubic),
          }}
        />
        <RNText style={bodyStyle}> {tokenSymbol}</RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  usdContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  display: {
    fontSize: 36,
    lineHeight: 40,
    fontFamily: 'BlackOpsOne_400Regular',
    letterSpacing: 36 * -0.025,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'SpaceMono_400Regular',
    letterSpacing: 0,
  },
});
