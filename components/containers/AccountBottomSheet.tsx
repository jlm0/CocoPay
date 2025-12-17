import { useCallback, forwardRef } from 'react';
import { BottomSheet, type BottomSheetMethods } from '@/components/ui/bottom-sheet';
import { AccountMenu } from '@/components/presentational/account-menu';
import { usePara } from '@/providers/ParaProvider';

const AccountBottomSheet = forwardRef<BottomSheetMethods>((_, ref) => {
  const { logout } = usePara();

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <BottomSheet ref={ref}>
      <AccountMenu onLogout={handleLogout} />
    </BottomSheet>
  );
});

AccountBottomSheet.displayName = 'AccountBottomSheet';

export { AccountBottomSheet };
