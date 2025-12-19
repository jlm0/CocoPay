import { View } from 'react-native';
import { TickerInput } from './ticker-input';
import { PercentageSlider } from './percentage-slider';
import { StepsList } from './steps-list';
import type { ValidationErrors } from '@/hooks/useStoreCreationForm';

type RewardsConfigFormProps = {
  ticker: string;
  cashBack: number;
  loyaltyBonus: number;
  onTickerChange: (value: string) => void;
  onCashBackChange: (value: number) => void;
  onLoyaltyBonusChange: (value: number) => void;
  errors: ValidationErrors;
  className?: string;
};

export function RewardsConfigForm({
  ticker,
  cashBack,
  loyaltyBonus,
  onTickerChange,
  onCashBackChange,
  onLoyaltyBonusChange,
  errors,
  className = '',
}: RewardsConfigFormProps) {
  return (
    <View className={className}>
      <StepsList
        title="How Coco works"
        steps={[
          'Your USDC revenue starts issuing your stablecoin 1:1.',
          'USDC revenue stays in CocoPay, you receive your coins.',
          'Your coins can be cashed out for USDC at any time.',
          'Use cash back to send a % of your issued coins to payers.',
          "Your coin's issuance can be set to decrease each quarter, rewarding early and loyal customers as your coin grows.",
        ]}
        className="mb-6"
      />

      <TickerInput value={ticker} onChangeText={onTickerChange} warning={errors.ticker} />

      <PercentageSlider
        label="Cash back"
        description="Send your stablecoin back to customers as they pay in."
        value={cashBack}
        onValueChange={onCashBackChange}
        minPercent={0}
        maxPercent={10}
        className="mt-6"
      />

      <PercentageSlider
        label="Loyalty bonus"
        description="Each quarter your stablecoin costs slightly more to make."
        value={loyaltyBonus}
        onValueChange={onLoyaltyBonusChange}
        minPercent={0}
        maxPercent={5}
        className="mt-6"
      />
    </View>
  );
}
