import { View, StyleSheet, Text as RNText, useColorScheme } from 'react-native';
import { Gift } from 'lucide-react-native';
import { AnimatedRollingNumber } from 'react-native-animated-rolling-numbers';
import { Easing } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { HEX_COLORS, COLORS } from '@/lib/theme';

type BalanceRewardsSectionProps = {
  totalRewards: number;
  className?: string;
};

export function BalanceRewardsSection({ totalRewards, className }: BalanceRewardsSectionProps) {
  const colorScheme = useColorScheme();
  const hasRewards = totalRewards > 0;
  const highlightStyle = { color: HEX_COLORS.primary };
  const mutedStyle = { color: COLORS[colorScheme ?? 'dark'].mutedForeground };

  return (
    <View className={cn('border border-border bg-card p-4', className)}>
      <View className="mb-3 flex-row items-center gap-2">
        <Icon as={Gift} size={16} className="text-primary" />
        <Text variant="small" className="text-muted-foreground">
          Store Rewards
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <RNText style={[styles.amount, hasRewards ? highlightStyle : mutedStyle]}>
          $
        </RNText>
        <AnimatedRollingNumber
          value={totalRewards}
          useGrouping
          toFixed={2}
          textStyle={[styles.amount, hasRewards ? highlightStyle : mutedStyle]}
          spinningAnimationConfig={{
            duration: 500,
            easing: Easing.out(Easing.cubic),
          }}
        />
      </View>

      <Text variant="caption" className="mt-2">
        {hasRewards
          ? 'Earned from store loyalty programs'
          : 'Earn rewards by shopping at participating stores'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amount: {
    fontSize: 32,
    lineHeight: 36,
    fontFamily: 'BlackOpsOne_400Regular',
    letterSpacing: 32 * -0.025,
  },
});
