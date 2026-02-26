import { cn } from '@/lib/utils';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';

const textVariants = cva(
  cn(
    'text-foreground text-base',
    Platform.select({
      web: 'select-text',
    })
  ),
  {
    variants: {
      variant: {
        default: 'font-mono',
        h1: cn(
          'text-center text-4xl font-display uppercase tracking-tight',
          Platform.select({ web: 'scroll-m-20 text-balance' })
        ),
        h2: cn(
          'border-foreground border-b-2 pb-2 text-3xl font-brutal uppercase tracking-tight',
          Platform.select({ web: 'scroll-m-20 first:mt-0' })
        ),
        h3: cn(
          'text-2xl font-brutal uppercase tracking-tight',
          Platform.select({ web: 'scroll-m-20' })
        ),
        h4: cn(
          'text-xl font-brutal uppercase tracking-tight',
          Platform.select({ web: 'scroll-m-20' })
        ),
        p: 'font-mono mt-3 leading-7 sm:mt-6',
        blockquote: 'font-mono mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6',
        code: cn('bg-muted relative px-[0.3rem] py-[0.2rem] font-mono text-sm'),
        lead: 'font-mono text-muted-foreground text-xl',
        large: 'text-lg font-brutal uppercase',
        small: 'text-sm font-mono leading-none',
        display: 'text-4xl font-display uppercase tracking-tight',
        'display-value': 'text-3xl font-ops uppercase tracking-tight',
        title: 'text-2xl font-brutal uppercase tracking-tight',
        heading: 'text-xl font-brutal uppercase tracking-tight',
        subheading: 'text-lg font-brutal uppercase tracking-tight',
        body: 'text-base font-mono',
        'body-emphasis': 'text-base font-brutal uppercase',
        label: 'text-xs font-brutal uppercase tracking-widest text-muted-foreground',
        ticker: 'text-base font-ops uppercase text-primary',
        'ticker-lg': 'text-lg font-ops uppercase text-primary',
        caption: 'text-sm font-mono text-muted-foreground',
        helper: 'text-sm font-mono text-muted-foreground',
        fine: 'text-xs font-mono text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps['variant']>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  blockquote: Platform.select({ web: 'blockquote' as Role }),
  code: Platform.select({ web: 'code' as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
};

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof RNText> &
  TextVariantProps &
  React.RefAttributes<RNText> & {
    asChild?: boolean;
  }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextClassContext };
