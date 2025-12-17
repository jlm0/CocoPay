import { createContext, useContext, useRef, useCallback, type ReactNode } from 'react';
import { AccountBottomSheet } from '@/components/containers/AccountBottomSheet';
import type { BottomSheetMethods } from '@/components/ui/bottom-sheet';

interface AccountSheetContextValue {
  openAccountSheet: () => void;
}

const AccountSheetContext = createContext<AccountSheetContextValue | null>(null);

export function AccountSheetProvider({ children }: { children: ReactNode }) {
  const sheetRef = useRef<BottomSheetMethods>(null);

  const openAccountSheet = useCallback(() => {
    sheetRef.current?.expand();
  }, []);

  return (
    <AccountSheetContext.Provider value={{ openAccountSheet }}>
      {children}
      <AccountBottomSheet ref={sheetRef} />
    </AccountSheetContext.Provider>
  );
}

export function useAccountSheet() {
  const context = useContext(AccountSheetContext);
  if (!context) {
    throw new Error('useAccountSheet must be used within AccountSheetProvider');
  }
  return context;
}
