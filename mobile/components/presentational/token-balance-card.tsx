import { Pressable } from 'react-native';
import { CurrencyDisplay } from './currency-display';
import { CHARACTER_LIMITS } from '@/lib/format';
import type { TokenType } from '@/types';

type TokenBalanceCardProps = {
  token: TokenType;
  usdValue: number;
  onPress?: () => void;
  maxCharacters?: number;
  className?: string;
};

export function TokenBalanceCard({
  token,
  usdValue,
  onPress,
  maxCharacters = CHARACTER_LIMITS.HOME_BALANCE,
  className = '',
}: TokenBalanceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={`rounded-xl p-3 active:bg-muted ${className}`}>
      <CurrencyDisplay label={token} value={usdValue} maxCharacters={maxCharacters} />
    </Pressable>
  );
}
