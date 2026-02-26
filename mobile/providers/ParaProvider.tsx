import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { para } from '@/lib/para';
import { useParaWallets } from '@/hooks/useParaWallets';
import { clearStoredStores, clearBalances } from '@/lib/storage';
import { AppSkeleton } from '@/components/presentational/app-skeleton';
import type { User, Wallet } from '@/types';

interface ParaContextValue {
  isReady: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  wallets: Wallet[];
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setAuthenticated: (authenticated: boolean) => void;
}

const ParaContext = createContext<ParaContextValue | null>(null);

interface ParaProviderProps {
  children: ReactNode;
}

export function ParaProvider({ children }: ParaProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRouteResolved, setIsRouteResolved] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const queryClient = useQueryClient();
  const { wallets, loadWallets, clearWallets } = useParaWallets();

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      const loggedIn = await para.isFullyLoggedIn();

      if (loggedIn) {
        setIsAuthenticated(true);
        await loadWallets();
      } else {
        setIsAuthenticated(false);
        setUser(null);
        clearWallets();
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [loadWallets, clearWallets]);

  const logout = useCallback(async () => {
    try {
      await para.logout();
      setIsAuthenticated(false);
      setUser(null);
      clearWallets();
      queryClient.clear();
      await Promise.all([clearStoredStores(), clearBalances()]);
    } catch {
      // Logout failed silently
    }
  }, [clearWallets, queryClient]);

  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  const setAuthenticatedState = useCallback(
    (authenticated: boolean) => {
      setIsAuthenticated(authenticated);
      if (authenticated) {
        loadWallets();
      } else {
        clearWallets();
      }
    },
    [loadWallets, clearWallets]
  );

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const initialize = async () => {
      try {
        await para.init();
        setIsReady(true);
        await checkAuth();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize Para';
        setInitError(message);
      }
    };

    initialize();
  }, [checkAuth]);

  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === '(app)';

    if (isAuthenticated && !inAuthGroup) {
      router.replace('/(app)/home');
    } else if (!isAuthenticated && inAuthGroup) {
      router.replace('/');
    }

    setIsRouteResolved(true);
  }, [isReady, isLoading, isAuthenticated, segments, router]);

  if (initError) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="mb-2 text-center font-brutal text-lg text-destructive">
          Initialization Error
        </Text>
        <Text className="text-center text-muted-foreground">{initError}</Text>
      </View>
    );
  }

  if (!isReady || isLoading || !isRouteResolved) {
    return <AppSkeleton />;
  }

  return (
    <ParaContext.Provider
      value={{
        isReady,
        isAuthenticated,
        isLoading,
        user,
        wallets,
        logout,
        refreshAuth,
        setAuthenticated: setAuthenticatedState,
      }}>
      {children}
    </ParaContext.Provider>
  );
}

export function usePara() {
  const context = useContext(ParaContext);
  if (!context) {
    throw new Error('usePara must be used within a ParaProvider');
  }
  return context;
}
