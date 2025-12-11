import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type PayButtonProps = {
  onPress?: () => void;
  className?: string;
};

export function PayButton({ onPress, className = '' }: PayButtonProps) {
  return (
    <Button onPress={onPress} className={`h-14 rounded-xl ${className}`}>
      <Text className="font-sans-semibold text-lg text-primary-foreground">Pay</Text>
    </Button>
  );
}
