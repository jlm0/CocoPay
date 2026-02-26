import * as React from 'react';
import { View } from 'react-native';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<React.ComponentRef<typeof View>, React.ComponentProps<typeof View>>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        'border-2 border-foreground bg-card text-card-foreground shadow-brutal-md',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  React.ComponentRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('flex flex-col gap-3 p-4', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  React.ComponentRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => (
  <TextClassContext.Provider value="text-2xl font-brutal uppercase leading-none tracking-tight">
    <View ref={ref} className={cn(className)} {...props} />
  </TextClassContext.Provider>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  React.ComponentRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => (
  <TextClassContext.Provider value="text-sm font-mono text-muted-foreground">
    <View ref={ref} className={cn(className)} {...props} />
  </TextClassContext.Provider>
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  React.ComponentRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('p-4 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  React.ComponentRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('flex flex-row items-center p-4 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
