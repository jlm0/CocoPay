import { Platform } from 'react-native';
import { Apple, Chrome } from 'lucide-react-native';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';

type Provider = 'apple' | 'google';

type SignInButtonProps = {
  isLoading?: boolean;
  provider?: Provider;
} & Omit<ButtonProps, 'children' | 'variant' | 'size'>;

const providerConfig = {
  apple: {
    buttonClassName: 'bg-foreground',
    textClassName: 'text-background',
    iconClassName: 'text-background',
    IconComponent: Apple,
    label: 'Apple',
  },
  google: {
    buttonClassName: 'bg-background border border-border',
    textClassName: 'text-foreground',
    iconClassName: 'text-foreground',
    IconComponent: Chrome,
    label: 'Google',
  },
};

export function SignInButton({
  isLoading = false,
  disabled,
  provider,
  className,
  ...buttonProps
}: SignInButtonProps) {
  const defaultProvider = Platform.OS === 'ios' ? 'apple' : 'google';
  const activeProvider = provider ?? defaultProvider;
  const config = providerConfig[activeProvider];
  const isDisabled = disabled || isLoading;

  return (
    <Button
      disabled={isDisabled}
      className={`h-14 flex-row items-center justify-center rounded-[28px] shadow-md ${config.buttonClassName} ${className || ''}`}
      {...buttonProps}>
      {isLoading ? (
        <Skeleton className="h-6 w-40 rounded-md" />
      ) : (
        <>
          <Icon as={config.IconComponent} size={24} className={config.iconClassName} />
          <Text className={`ml-3 font-sans-semibold text-lg ${config.textClassName}`}>
            Sign in with {config.label}
          </Text>
        </>
      )}
    </Button>
  );
}
