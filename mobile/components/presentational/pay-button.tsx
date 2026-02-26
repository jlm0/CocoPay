import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type PayButtonProps = {
  onPress?: () => void;
  className?: string;
};

export function PayButton({ onPress, className = '' }: PayButtonProps) {
  return (
    <Button onPress={onPress} size="lg" className={`h-14 ${className}`}>
      <Text>Pay</Text>
    </Button>
  );
}
