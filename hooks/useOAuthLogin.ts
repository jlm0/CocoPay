import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { para } from '@/lib/para';
import { openAuthUrl } from '@/lib/auth';
import type { AuthStatus } from '@/types';

interface UseOAuthLoginResult {
  status: AuthStatus;
  error: string | null;
  loginWithApple: () => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  login: () => Promise<boolean>;
  reset: () => void;
}

export function useOAuthLogin(onSuccess: () => void): UseOAuthLoginResult {
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const touchSession = useCallback(async () => {
    await para.touchSession();
  }, []);

  const waitForLoginAndFinish = useCallback(async () => {
    await para.waitForLogin({});
    await touchSession();
    setStatus('success');
    onSuccess();
  }, [touchSession, onSuccess]);

  const loginWithApple = useCallback(async (): Promise<boolean> => {
    try {
      reset();
      setStatus('loading');

      const oauthUrl = await para.getOAuthUrl({ method: 'APPLE' });

      const result = await openAuthUrl(oauthUrl);

      if (!result.success) {
        throw new Error('Authentication was cancelled');
      }

      await waitForLoginAndFinish();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Apple login failed';
      setError(message);
      setStatus('error');
      return false;
    }
  }, [reset, waitForLoginAndFinish]);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      reset();
      setStatus('loading');

      const oauthUrl = await para.getOAuthUrl({ method: 'GOOGLE' });

      const result = await openAuthUrl(oauthUrl);

      if (!result.success) {
        throw new Error('Authentication was cancelled');
      }

      await waitForLoginAndFinish();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setError(message);
      setStatus('error');
      return false;
    }
  }, [reset, waitForLoginAndFinish]);

  const login = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      return loginWithApple();
    }
    return loginWithGoogle();
  }, [loginWithApple, loginWithGoogle]);

  return {
    status,
    error,
    loginWithApple,
    loginWithGoogle,
    login,
    reset,
  };
}
