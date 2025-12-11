import { useState, useCallback } from 'react';
import { para } from '@/lib/para';
import { openAuthUrl } from '@/lib/auth';
import type { AuthStatus } from '@/types';

interface UseParaEmailLoginResult {
  status: AuthStatus;
  error: string | null;
  loginWithEmail: (email: string) => Promise<boolean>;
  reset: () => void;
}

export function useParaEmailLogin(onSuccess: () => void): UseParaEmailLoginResult {
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const loginWithEmail = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        reset();
        setStatus('loading');

        try {
          await para.logout();
        } catch {
          // User may not be logged in, ignore
        }

        const authState = await para.signUpOrLogIn({ auth: { email } });

        if (authState?.stage === 'verify' && 'loginUrl' in authState && authState.loginUrl) {
          const result = await openAuthUrl(authState.loginUrl);

          if (!result.success) {
            throw new Error('Authentication was cancelled');
          }

          if (authState.nextStage === 'login') {
            await para.waitForLogin({});
          } else {
            await para.waitForWalletCreation({});
          }

          setStatus('success');
          onSuccess();
          return true;
        }

        throw new Error('One-click login not available for this account');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        setStatus('error');
        return false;
      }
    },
    [reset, onSuccess]
  );

  return {
    status,
    error,
    loginWithEmail,
    reset,
  };
}
