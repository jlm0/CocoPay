import { View, Pressable, Image } from 'react-native';
import { ImagePlus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
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
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <View className={className}>
      <View className="mb-2 flex-row items-center justify-between">
        <Label>Logo</Label>
        <Text variant="caption">Optional</Text>
      </View>

      {imageUri ? (
        <View className="flex-row items-center gap-4">
          <View className="relative">
            <Image
              source={{ uri: imageUri }}
              className="h-20 w-20 rounded-full"
              resizeMode="cover"
            />
            <Pressable
              onPress={onImageRemoved}
              className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-destructive">
              <Icon as={X} className="text-destructive-foreground" size={14} />
            </Pressable>
          </View>
          <Pressable onPress={handlePickImage}>
            <Text className="text-primary">Change image</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handlePickImage}
          className={cn(
            'h-20 w-20 items-center justify-center rounded-full',
            'border-2 border-dashed border-muted-foreground/30',
            'active:bg-muted'
          )}>
          <Icon as={ImagePlus} className="text-muted-foreground" size={24} />
        </Pressable>
      )}
    </View>
  );
}
