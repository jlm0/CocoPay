import { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { cn } from '@/lib/utils';
import * as AvatarPrimitive from '@rn-primitives/avatar';

function Avatar({
  className,
  ...props
}: AvatarPrimitive.RootProps & React.RefAttributes<AvatarPrimitive.RootRef>) {
  return (
    <AvatarPrimitive.Root
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: AvatarPrimitive.ImageProps & React.RefAttributes<AvatarPrimitive.ImageRef>) {
  return <AvatarPrimitive.Image className={cn('aspect-square size-full', className)} {...props} />;
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.FallbackProps & React.RefAttributes<AvatarPrimitive.FallbackRef>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'flex size-full flex-row items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    />
  );
}

type CachedAvatarProps = {
  source: string | null | undefined;
  fallback: React.ReactNode;
  fallbackClassName?: string;
  className?: string;
  alt?: string;
};

function CachedAvatar({ source, fallback, fallbackClassName, className, alt }: CachedAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!source);

  const showFallback = !source || hasError || isLoading;

  return (
    <View
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      accessibilityLabel={alt}>
      {showFallback && (
        <View
          className={cn(
            'absolute inset-0 flex flex-row items-center justify-center rounded-full bg-muted',
            isLoading && !hasError && 'animate-pulse',
            fallbackClassName
          )}>
          {fallback}
        </View>
      )}
      {!!source && !hasError && (
        <Image
          source={{ uri: source }}
          cachePolicy="disk"
          transition={200}
          contentFit="cover"
          style={{
            width: '100%',
            height: '100%',
            opacity: isLoading ? 0 : 1,
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
    </View>
  );
}

export { Avatar, AvatarFallback, AvatarImage, CachedAvatar };
