import { Platform } from 'react-native';
import { Chrome } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';

type Provider = 'apple' | 'google';

type SignInButtonProps = {
  isLoading?: boolean;
  provider?: Provider;
} & Omit<ButtonProps, 'children' | 'variant' | 'size'>;

type ProviderConfig = {
  buttonClassName: string;
  textClassName: string;
  iconClassName: string;
  label: string;
};

const providerConfig: Record<Provider, ProviderConfig> = {
  apple: {
    buttonClassName: 'bg-foreground',
    textClassName: 'text-background',
    iconClassName: 'text-background',
    label: 'Apple',
  },
  google: {
    buttonClassName: 'bg-background border border-border',
    textClassName: 'text-foreground',
    iconClassName: 'text-foreground',
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
          {activeProvider === 'apple' ? (
            <Ionicons name="logo-apple" size={24} color="#ffffff" />
          ) : (
            <Icon as={Chrome} size={24} className={config.iconClassName} />
          )}
          <Text className={`ml-3 font-sans-semibold text-lg ${config.textClassName}`}>
            Sign in with {config.label}
          </Text>
        </>
      )}
    </Button>
  );
}
