import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePara } from '@/providers/ParaProvider';
import { useParaOAuthLogin } from '@/hooks/useParaOAuthLogin';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { SignInButton } from '@/components/presentational/sign-in-button';
import { ScreenContainer } from '@/components/presentational/screen-container';

// TODO: Remove this bypass before production
const BYPASS_AUTH = true;

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = usePara();

  const handleLoginSuccess = () => {
    router.replace('/(app)/home');
  };

  const { login, status, error } = useParaOAuthLogin(handleLoginSuccess);

  useEffect(() => {
    if (BYPASS_AUTH) {
      router.replace('/(app)/home');
      return;
    }
    if (!isAuthLoading && isAuthenticated) {
      router.replace('/(app)/home');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (BYPASS_AUTH || isAuthLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Skeleton className="h-12 w-48 rounded-xl" />
      </ScreenContainer>
    );
  }

  const isSigningIn = status === 'loading';

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center">
        <Text variant="heading" className="mb-4 text-center">
          CocoPay 🥥
        </Text>
        <Text variant="body" className="mb-8 text-center text-muted-foreground">
          Payments and rewards powered by Juicebox
        </Text>
      </View>

      <View className="gap-3">
        {error && (
          <Text variant="caption" className="mb-4 text-center text-destructive">
            {error}
          </Text>
        )}
        <SignInButton onPress={login} isLoading={isSigningIn} />
      </View>
    </ScreenContainer>
  );
}
