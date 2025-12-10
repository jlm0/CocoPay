import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Text variant="heading" className="mb-4">
        {"This screen doesn't exist."}
      </Text>
      <Link href="/">
        <Text variant="body" className="text-indigo-500">
          Go to home screen!
        </Text>
      </Link>
    </View>
  );
}
