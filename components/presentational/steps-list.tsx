import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type StepsListProps = {
  title: string;
  steps: string[];
  className?: string;
};

export function StepsList({ title, steps, className }: StepsListProps) {
  return (
    <View className={cn(className)}>
      <Text variant="body" className="mb-2 font-semibold">
        {title}
      </Text>
      <View className="gap-1">
        {steps.map((step, index) => (
          <View key={index} className="flex-row">
            <Text variant="caption" className="mr-2 text-gray-500">
              {index + 1}.
            </Text>
            <Text variant="caption" className="flex-1 text-gray-500">
              {step}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
