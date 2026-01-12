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
  const showImage = !!source && !hasError;

  return (
    <View
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      accessibilityLabel={alt}>
      {showImage ? (
        <Image
          source={{ uri: source }}
          cachePolicy="disk"
          transition={200}
          contentFit="cover"
          style={{ width: '100%', height: '100%' }}
          onError={() => setHasError(true)}
        />
      ) : (
        <View
          className={cn(
            'flex size-full flex-row items-center justify-center rounded-full bg-muted',
            fallbackClassName
          )}>
          {fallback}
        </View>
      )}
    </View>
  );
}

export { Avatar, AvatarFallback, AvatarImage, CachedAvatar };
