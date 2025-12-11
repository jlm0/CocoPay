import { useState } from 'react';
import { View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HEX_COLORS } from '@/lib/theme';
import { EmailInput } from '@/components/presentational/email-input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useParaEmailLogin } from '@/hooks/useParaEmailLogin';

export default function AuthPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const handleLoginSuccess = () => {
    router.replace('/(app)/home');
  };

  const { loginWithEmail, status, error } = useParaEmailLogin(handleLoginSuccess);

  const isValidEmail = email.includes('@') && email.includes('.');
  const isLoading = status === 'loading';

  const handleContinue = () => {
    loginWithEmail(email);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}>
      <View className="flex-1 px-6">
        <View className="py-4">
          <Text variant="body" className="text-muted-foreground">
            Sign in
          </Text>
        </View>

        <View className="mt-8">
          <Text variant="display-medium">Welcome back</Text>
          <Text variant="body" className="mt-2 text-muted-foreground">
            Enter your email to continue
          </Text>
        </View>

        <View className="mt-8">
          <EmailInput value={email} onChangeText={setEmail} />

          {error && (
            <Text variant="caption" className="mt-4 text-destructive">
              {error}
            </Text>
          )}
        </View>

        <View className="mt-8">
          <Button
            onPress={handleContinue}
            disabled={!isValidEmail || isLoading}
            className="h-14 rounded-xl">
            {isLoading ? (
              <ActivityIndicator color={HEX_COLORS.background} />
            ) : (
              <Text className="font-sans-semibold text-primary-foreground">
                Continue with email
              </Text>
            )}
          </Button>
        </View>

        <View className="flex-1" />

        <View className="pb-8" style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
          <Text variant="caption" className="text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
