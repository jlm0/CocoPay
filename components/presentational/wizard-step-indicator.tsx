import { View } from 'react-native';
import { cn } from '@/lib/utils';

type WizardStepIndicatorProps = {
  currentStep: 1 | 2;
  className?: string;
};

export function WizardStepIndicator({ currentStep, className = '' }: WizardStepIndicatorProps) {
  return (
    <View className={cn('flex-row gap-2', className)}>
      <View className="h-1 flex-1 rounded-full bg-primary" />
      <View
        className={cn('h-1 flex-1 rounded-full', currentStep === 2 ? 'bg-primary' : 'bg-muted')}
      />
    </View>
  );
}
