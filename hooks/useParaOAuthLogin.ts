import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { para } from '@/lib/para';
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
      console.log('[Para Auth] Starting Apple OAuth flow...');

      console.log('[Para Auth] Getting OAuth URL...');
      const oauthUrl = await para.getOAuthUrl({ method: 'APPLE' });
      console.log('[Para Auth] Apple OAuth URL:', oauthUrl);
      // TODO: Restore browser auth
      // const result = await openAuthUrl(oauthUrl);
      // if (!result.success) {
      //   throw new Error('Authentication was cancelled');
      // }

      console.log('[Para Auth] Calling verifyOAuth...');
      const authState = await para.verifyOAuth({ method: 'APPLE' });
      console.log('[Para Auth] verifyOAuth returned:', JSON.stringify(authState, null, 2));

      if (authState.stage === 'signup') {
        console.log('[Para Auth] Stage: signup - calling waitForWalletCreation...');
        const walletResult = await para.waitForWalletCreation({});
        console.log(
          '[Para Auth] waitForWalletCreation result:',
          JSON.stringify(walletResult, null, 2)
        );
        setStatus('success');
        onSuccess();
        return true;
      }

      if (authState.stage === 'login') {
        console.log('[Para Auth] Stage: login - calling waitForLogin...');
        const loginResult = await para.waitForLogin({});
        console.log('[Para Auth] waitForLogin result:', JSON.stringify(loginResult, null, 2));
        setStatus('success');
        onSuccess();
        return true;
      }

      if (authState.stage === 'done') {
        console.log('[Para Auth] Stage: done - isNewUser:', authState.isNewUser);
        if (authState.isNewUser) {
          console.log('[Para Auth] New user - calling waitForWalletCreation...');
          const walletResult = await para.waitForWalletCreation({});
          console.log(
            '[Para Auth] waitForWalletCreation result:',
            JSON.stringify(walletResult, null, 2)
          );
        } else {
          console.log('[Para Auth] Existing user - calling waitForLogin...');
          const loginResult = await para.waitForLogin({});
          console.log('[Para Auth] waitForLogin result:', JSON.stringify(loginResult, null, 2));
        }
        setStatus('success');
        onSuccess();
        return true;
      }

      throw new Error(`Unexpected OAuth state: ${(authState as { stage: string }).stage}`);
    } catch (err) {
      console.log('[Para Auth] Apple OAuth error:', err);
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
      console.log('[Para Auth] Starting Google OAuth flow...');

      console.log('[Para Auth] Getting OAuth URL...');
      const oauthUrl = await para.getOAuthUrl({ method: 'GOOGLE' });
      console.log('[Para Auth] Google OAuth URL:', oauthUrl);
      // TODO: Restore browser auth
      // const result = await openAuthUrl(oauthUrl);
      // if (!result.success) {
      //   throw new Error('Authentication was cancelled');
      // }

      console.log('[Para Auth] Calling verifyOAuth...');
      const authState = await para.verifyOAuth({ method: 'GOOGLE' });
      console.log('[Para Auth] verifyOAuth returned:', JSON.stringify(authState, null, 2));

      if (authState.stage === 'signup') {
        console.log('[Para Auth] Stage: signup - calling waitForWalletCreation...');
        const walletResult = await para.waitForWalletCreation({});
        console.log(
          '[Para Auth] waitForWalletCreation result:',
          JSON.stringify(walletResult, null, 2)
        );
        setStatus('success');
        onSuccess();
        return true;
      }

      if (authState.stage === 'login') {
        console.log('[Para Auth] Stage: login - calling waitForLogin...');
        const loginResult = await para.waitForLogin({});
        console.log('[Para Auth] waitForLogin result:', JSON.stringify(loginResult, null, 2));
        setStatus('success');
        onSuccess();
        return true;
      }

      if (authState.stage === 'done') {
        console.log('[Para Auth] Stage: done - isNewUser:', authState.isNewUser);
        if (authState.isNewUser) {
          console.log('[Para Auth] New user - calling waitForWalletCreation...');
          const walletResult = await para.waitForWalletCreation({});
          console.log(
            '[Para Auth] waitForWalletCreation result:',
            JSON.stringify(walletResult, null, 2)
          );
        } else {
          console.log('[Para Auth] Existing user - calling waitForLogin...');
          const loginResult = await para.waitForLogin({});
          console.log('[Para Auth] waitForLogin result:', JSON.stringify(loginResult, null, 2));
        }
        setStatus('success');
        onSuccess();
        return true;
      }

      throw new Error(`Unexpected OAuth state: ${(authState as { stage: string }).stage}`);
    } catch (err) {
      console.log('[Para Auth] Google OAuth error:', err);
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
