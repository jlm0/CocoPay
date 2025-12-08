import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

type TextVariant = 'heading' | 'subheading' | 'body' | 'caption';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  className?: string;
}

const variantStyles: Record<TextVariant, string> = {
  heading: 'text-3xl font-bold text-gray-900',
  subheading: 'text-xl font-semibold text-gray-800',
  body: 'text-base text-gray-700',
  caption: 'text-sm text-gray-500',
};

export function Text({ variant = 'body', className = '', children, ...props }: TextProps) {
  return (
    <RNText className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </RNText>
  );
}
