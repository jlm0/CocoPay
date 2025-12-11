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
        console.log('[Para Email Auth] ========== STARTING EMAIL LOGIN ==========');
        console.log('[Para Email Auth] Email:', email);

        console.log('[Para Email Auth] Calling para.signUpOrLogIn...');
        const authState = await para.signUpOrLogIn({ auth: { email } });
        console.log('[Para Email Auth] signUpOrLogIn response:');
        console.log('[Para Email Auth]   - stage:', authState?.stage);
        console.log(
          '[Para Email Auth]   - nextStage:',
          (authState as { nextStage?: string })?.nextStage
        );
        console.log('[Para Email Auth]   - hasLoginUrl:', 'loginUrl' in (authState || {}));
        console.log('[Para Email Auth]   - full response:', JSON.stringify(authState, null, 2));

        if (authState?.stage === 'verify' && 'loginUrl' in authState && authState.loginUrl) {
          console.log('[Para Email Auth] Stage is "verify" with loginUrl present');
          console.log('[Para Email Auth] Login URL:', authState.loginUrl);
          console.log('[Para Email Auth] Opening auth URL in browser...');

          const result = await openAuthUrl(authState.loginUrl);
          console.log('[Para Email Auth] openAuthUrl returned:', JSON.stringify(result, null, 2));

          if (!result.success) {
            console.log('[Para Email Auth] Auth was cancelled by user');
            throw new Error('Authentication was cancelled');
          }

          console.log('[Para Email Auth] Browser auth completed successfully');
          console.log('[Para Email Auth] nextStage value:', authState.nextStage);

          if (authState.nextStage === 'login') {
            console.log('[Para Email Auth] nextStage is "login" - calling para.waitForLogin()...');
            console.log('[Para Email Auth] This may hang if OTP verification is incomplete');
            console.log(
              '[Para Email Auth] isWalletSelectionNeeded:',
              (authState as { isWalletSelectionNeeded?: boolean }).isWalletSelectionNeeded
            );

            let pollCount = 0;
            const loginResult = await para.waitForLogin({
              onPoll: async () => {
                pollCount++;
                const isActive = await para.isSessionActive();
                const isFullyLoggedIn = await para.isFullyLoggedIn();
                console.log(`[Para Email Auth] waitForLogin polling... (attempt ${pollCount})`);
                console.log(`[Para Email Auth]   - isSessionActive: ${isActive}`);
                console.log(`[Para Email Auth]   - isFullyLoggedIn: ${isFullyLoggedIn}`);
              },
              onCancel: () => {
                console.log('[Para Email Auth] waitForLogin was cancelled');
              },
            });
            console.log(
              '[Para Email Auth] waitForLogin returned:',
              JSON.stringify(loginResult, null, 2)
            );
          } else {
            console.log(
              '[Para Email Auth] nextStage is NOT "login" (value:',
              authState.nextStage,
              ')'
            );
            console.log('[Para Email Auth] Calling para.waitForWalletCreation()...');
            let pollCount = 0;
            const walletResult = await para.waitForWalletCreation({
              onPoll: () => {
                pollCount++;
                console.log(
                  `[Para Email Auth] waitForWalletCreation polling... (attempt ${pollCount})`
                );
              },
              onCancel: () => {
                console.log('[Para Email Auth] waitForWalletCreation was cancelled');
              },
            });
            console.log(
              '[Para Email Auth] waitForWalletCreation returned:',
              JSON.stringify(walletResult, null, 2)
            );
          }

          console.log('[Para Email Auth] ========== LOGIN SUCCESSFUL ==========');
          setStatus('success');
          onSuccess();
          return true;
        }

        console.log('[Para Email Auth] Stage is NOT "verify" or loginUrl missing');
        console.log('[Para Email Auth] Cannot proceed with one-click login');
        throw new Error('One-click login not available for this account');
      } catch (err) {
        console.log('[Para Email Auth] ========== LOGIN ERROR ==========');
        console.log('[Para Email Auth] Error type:', err?.constructor?.name);
        console.log(
          '[Para Email Auth] Error message:',
          err instanceof Error ? err.message : String(err)
        );
        console.log('[Para Email Auth] Full error:', err);
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
