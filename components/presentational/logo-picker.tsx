import { useState } from 'react';
import { View, Pressable, Image } from 'react-native';
import { ImagePlus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type LogoPickerProps = {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
  className?: string;
};

export function LogoPicker({
  imageUri,
  onImageSelected,
  onImageRemoved,
  className = '',
}: LogoPickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    setIsLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View className={cn('items-center', className)}>
        <View className="items-center gap-2">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-4 w-16 rounded" />
        </View>
      </View>
    );
  }

  return (
    <View className={cn('items-center', className)}>
      {imageUri ? (
        <View className="items-center gap-2">
          <View className="relative">
            <Image
              source={{ uri: imageUri }}
              className="h-24 w-24 rounded-full"
              resizeMode="cover"
            />
            <Pressable
              onPress={onImageRemoved}
              className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-destructive">
              <Icon as={X} className="text-destructive-foreground" size={14} />
            </Pressable>
          </View>
          <Pressable onPress={handlePickImage}>
            <Text className="text-primary">Change</Text>
          </Pressable>
        </View>
      ) : (
        <View className="items-center gap-2">
          <Pressable
            onPress={handlePickImage}
            className={cn(
              'h-24 w-24 items-center justify-center rounded-full',
              'border-2 border-dashed border-muted-foreground/30',
              'active:bg-muted'
            )}>
            <Icon as={ImagePlus} className="text-muted-foreground" size={28} />
          </Pressable>
          <Text variant="caption">Add logo</Text>
        </View>
      )}
    </View>
  );
}
