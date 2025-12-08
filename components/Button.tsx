import { forwardRef } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ActivityIndicator,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = {
  title: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
} & TouchableOpacityProps;

const variantStyles: Record<ButtonVariant, { button: string; text: string }> = {
  primary: {
    button: 'bg-indigo-500',
    text: 'text-white',
  },
  secondary: {
    button: 'bg-gray-100',
    text: 'text-gray-900',
  },
  outline: {
    button: 'bg-transparent border-2 border-indigo-500',
    text: 'text-indigo-500',
  },
};

export const Button = forwardRef<View, ButtonProps>(
  ({ title, variant = 'primary', isLoading = false, disabled, ...touchableProps }, ref) => {
    const styles = variantStyles[variant];
    const isDisabled = disabled || isLoading;

    return (
      <TouchableOpacity
        ref={ref}
        disabled={isDisabled}
        {...touchableProps}
        className={`items-center rounded-[28px] p-4 shadow-md ${styles.button} ${isDisabled ? 'opacity-50' : ''} ${touchableProps.className || ''}`}>
        {isLoading ? (
          <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#4F46E5'} size="small" />
        ) : (
          <Text className={`text-center text-lg font-semibold ${styles.text}`}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';
