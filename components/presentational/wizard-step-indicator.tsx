import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type WizardStepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
};

export function WizardStepIndicator({
  currentStep,
  totalSteps,
  labels = ['Profile', 'Rewards'],
  className = '',
}: WizardStepIndicatorProps) {
  return (
    <View className={cn('flex-row items-center justify-center', className)}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isLast = stepNumber === totalSteps;

        return (
          <View key={stepNumber} className="flex-row items-center">
            <View className="items-center">
              <View
                className={cn(
                  'h-8 w-8 items-center justify-center rounded-full',
                  isCompleted && 'bg-primary',
                  isActive && 'border-2 border-primary bg-transparent',
                  !isActive && !isCompleted && 'border-2 border-muted-foreground/30 bg-transparent'
                )}>
                {isCompleted ? (
                  <Animated.View entering={FadeIn.duration(200)}>
                    <Icon as={Check} className="text-primary-foreground" size={16} />
                  </Animated.View>
                ) : (
                  <Text
                    className={cn(
                      'font-sans-semibold text-sm',
                      isActive && 'text-primary',
                      !isActive && 'text-muted-foreground/50'
                    )}>
                    {stepNumber}
                  </Text>
                )}
              </View>
              <Text
                className={cn(
                  'mt-1 text-xs',
                  isActive && 'font-sans-semibold text-foreground',
                  isCompleted && 'text-primary',
                  !isActive && !isCompleted && 'text-muted-foreground/50'
                )}>
                {labels[index] ?? `Step ${stepNumber}`}
              </Text>
            </View>

            {!isLast && (
              <View
                className={cn(
                  'mx-3 h-0.5 w-12',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                )}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
