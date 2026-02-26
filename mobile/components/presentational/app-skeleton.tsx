import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Skeleton } from '@/components/ui/skeleton';
import { ScreenContainer } from '@/components/presentational/screen-container';

export function AppSkeleton() {
  return (
    <ScreenContainer>
      <LinearGradient
        colors={['rgba(186, 255, 41, 0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        className="absolute inset-0"
      />

      <View className="flex-[0.35]" />

      <View className="items-center">
        <Skeleton className="mb-3 h-14 w-48" />
        <Skeleton className="h-2 w-24" />
      </View>

      <View className="flex-[0.15]" />

      <View className="items-center gap-3">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-5 w-56" />
      </View>

      <View className="flex-1" />

      <View className="gap-3">
        <Skeleton className="h-14 w-full" />
      </View>
    </ScreenContainer>
  );
}
