import { useState } from 'react';
import {
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { HEX_COLORS } from '@/lib/theme';
import { EmailInput } from '@/components/presentational/email-input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useParaEmailLogin } from '@/hooks/useParaEmailLogin';

function GradientWave() {
  const { width } = useWindowDimensions();
  const height = 280;

  return (
    <View className="absolute left-0 right-0 top-0" style={{ height }}>
      <LinearGradient
        colors={['rgba(186, 255, 41, 0.15)', 'rgba(186, 255, 41, 0.08)', 'transparent']}
        locations={[0, 0.6, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="absolute bottom-0 left-0 right-0">
        <Svg width={width} height={80} viewBox={`0 0 ${width} 80`}>
          <Path
            d={`M0,40 Q${width * 0.25},80 ${width * 0.5},40 T${width},40 L${width},80 L0,80 Z`}
            fill={HEX_COLORS.background}
          />
        </Svg>
      </View>
    </View>
  );
}

export default function AuthPage() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const { loginWithEmail, status, error } = useParaEmailLogin();

  const isValidEmail = email.includes('@') && email.includes('.');
  const isLoading = status === 'loading';

  const handleContinue = () => {
    loginWithEmail(email);
  };

  return (
    <View className="flex-1 bg-background">
      <GradientWave />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ paddingTop: insets.top }}>
        <View className="flex-1 px-6">
          <View style={{ height: 200 }} />

          <View>
            <Text variant="display" className="text-foreground">
              Welcome back
            </Text>
            <Text variant="body" className="mt-3 text-muted-foreground">
              Enter your email to continue
            </Text>
          </View>

          <View className="mt-10">
            <EmailInput value={email} onChangeText={setEmail} />

            {error && (
              <Text variant="caption" className="mt-3 text-destructive">
                {error}
              </Text>
            )}
          </View>

          <View className="mt-6">
            <Button
              onPress={handleContinue}
              disabled={!isValidEmail || isLoading}
              size="lg"
              className="h-14">
              {isLoading ? (
                <ActivityIndicator color={HEX_COLORS.background} />
              ) : (
                <Text className="font-brutal uppercase text-primary-foreground">Continue with email</Text>
              )}
            </Button>
          </View>

          <View className="flex-1" />

          <View style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
            <Text variant="fine" className="text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
