import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { para } from '@/lib/para';
import { openAuthUrl } from '@/lib/auth';
import type { AuthStatus } from '@/types';

interface UseParaOAuthLoginResult {
  status: AuthStatus;
  error: string | null;
  loginWithApple: () => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  login: () => Promise<boolean>;
  reset: () => void;
}

export function useParaOAuthLogin(onSuccess: () => void): UseParaOAuthLoginResult {
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const loginWithApple = useCallback(async (): Promise<boolean> => {
    try {
      reset();
      setStatus('loading');

      const oauthUrl = await para.getOAuthUrl({ method: 'APPLE' });
      const result = await openAuthUrl(oauthUrl);

      if (!result.success) {
        throw new Error('Authentication was cancelled');
      }

      const authState = await para.verifyOAuth({ method: 'APPLE' });

      if (authState.stage === 'done') {
        if (authState.isNewUser) {
          await para.waitForWalletCreation({});
        } else {
          await para.waitForLogin({});
        }

        setStatus('success');
        onSuccess();
        return true;
      }

      throw new Error('Unexpected OAuth state');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Apple login failed';
      setError(message);
      setStatus('error');
      return false;
    }
  }, [reset, onSuccess]);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      reset();
      setStatus('loading');

      const oauthUrl = await para.getOAuthUrl({ method: 'GOOGLE' });
      const result = await openAuthUrl(oauthUrl);

      if (!result.success) {
        throw new Error('Authentication was cancelled');
      }

      const authState = await para.verifyOAuth({ method: 'GOOGLE' });

      if (authState.stage === 'done') {
        if (authState.isNewUser) {
          await para.waitForWalletCreation({});
        } else {
          await para.waitForLogin({});
        }

        setStatus('success');
        onSuccess();
        return true;
      }

      throw new Error('Unexpected OAuth state');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setError(message);
      setStatus('error');
      return false;
    }
  }, [reset, onSuccess]);

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
