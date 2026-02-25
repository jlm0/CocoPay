import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { StoreCreationParams } from '@/types/juicebox';

interface StoreCreationContextValue {
  creationParams: StoreCreationParams | null;
  setCreationParams: (params: StoreCreationParams) => void;
  clearCreationParams: () => void;
}

const StoreCreationContext = createContext<StoreCreationContextValue | null>(null);

export function StoreCreationProvider({ children }: { children: ReactNode }) {
  const [creationParams, setCreationParams] = useState<StoreCreationParams | null>(null);

  const clearCreationParams = useCallback(() => setCreationParams(null), []);

  const value = useMemo(
    () => ({
      creationParams,
      setCreationParams,
      clearCreationParams,
    }),
    [creationParams, clearCreationParams]
  );

  return <StoreCreationContext.Provider value={value}>{children}</StoreCreationContext.Provider>;
}

export function useStoreCreation() {
  const context = useContext(StoreCreationContext);
  if (!context) {
    throw new Error('useStoreCreation must be used within StoreCreationProvider');
  }
  return context;
}
