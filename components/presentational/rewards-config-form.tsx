import { View } from 'react-native';
import { TickerInput } from './ticker-input';
import { PercentageSlider } from './percentage-slider';
import { HowItWorksCard } from './how-it-works-card';
import type { ValidationErrors } from '@/hooks/useStoreCreationForm';

type RewardsConfigFormProps = {
  ticker: string;
  cashBack: number;
  onTickerChange: (value: string) => void;
  onCashBackChange: (value: number) => void;
  onFieldBlur: (field: 'ticker') => void;
  errors: ValidationErrors;
  disabled?: boolean;
  className?: string;
};

export function RewardsConfigForm({
  ticker,
  cashBack,
  onTickerChange,
  onCashBackChange,
  onFieldBlur,
  errors,
  disabled,
  className = '',
}: RewardsConfigFormProps) {
  return (
    <View className={className}>
      <TickerInput
        value={ticker}
        onChangeText={onTickerChange}
        onBlur={() => onFieldBlur('ticker')}
        error={errors.ticker}
        disabled={disabled}
      />

      <PercentageSlider
        label="Cash Back"
        description="Send your stablecoin back to customers as they pay in."
        value={cashBack}
        onValueChange={onCashBackChange}
        minPercent={0}
        maxPercent={10}
        disabled={disabled}
        className="mt-6"
      />

      <HowItWorksCard className="mt-6" />
    </View>
  );
}
