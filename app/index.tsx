import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePara } from '@/providers/ParaProvider';
import { useOAuthLogin } from '@/hooks/useOAuthLogin';
import { Text } from '@/components/ui/Text';
import { Spinner } from '@/components/ui/Spinner';
import { SignInButton } from '@/components/SignInButton';

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = usePara();

  const handleLoginSuccess = () => {
    router.replace('/(app)/home');
  };

  const { login, status, error } = useOAuthLogin(handleLoginSuccess);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace('/(app)/home');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Spinner />
      </View>
    );
  }

  const isSigningIn = status === 'loading';

  return (
    <View className="flex-1 bg-white px-6">
      <View className="flex-1 items-center justify-center">
        <Text variant="heading" className="mb-4 text-center">
          Welcome to Cocopay
        </Text>
        <Text variant="body" className="mb-8 text-center text-gray-500">
          Payments and rewards powered by Juicebox
        </Text>
      </View>

      <View className="pb-12">
        {error && (
          <Text variant="caption" className="mb-4 text-center text-red-500">
            {error}
          </Text>
        )}
        <SignInButton onPress={login} isLoading={isSigningIn} />
      </View>
    </View>
  );
}
