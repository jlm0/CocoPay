import { useState, useMemo, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { HeroAmountInput } from '@/components/presentational/hero-amount-input';
import { PayBalanceDisplay } from '@/components/presentational/pay-balance-display';
import { PayStoreInfo } from '@/components/presentational/pay-store-info';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useStoreDetails } from '@/hooks/useStoreDetails';
import { useViemUsdcBalance } from '@/hooks/useViemUsdcBalance';
import { parseStoreCode } from '@/lib/juicebox/transforms';

type PayContainerProps = {
  initialStoreCode?: string;
  initialAmount?: string;
};

export function PayContainer({ initialStoreCode, initialAmount }: PayContainerProps) {
  const [storeCode, setStoreCode] = useState(initialStoreCode ?? '');
  const [amount, setAmount] = useState(initialAmount ? `$${initialAmount}` : '');
  const [isEditing, setIsEditing] = useState(!initialStoreCode);

  const parsedCode = useMemo(() => parseStoreCode(storeCode), [storeCode]);

  const {
    store,
    isLoading: storeLoading,
    error: storeError,
  } = useStoreDetails(
    parsedCode?.projectId ? Number(parsedCode.projectId) : 0,
    parsedCode?.chainId ?? 0
  );

  const { data: usdcBalance, isLoading: balanceLoading } = useViemUsdcBalance();

  useEffect(() => {
    if (store && !isEditing) {
      setIsEditing(false);
    }
  }, [store, isEditing]);

  const numericAmount = useMemo(() => {
    const cleaned = amount.replace(/[$,]/g, '');
    return parseFloat(cleaned) || 0;
  }, [amount]);

  const usdcBalanceNum = usdcBalance?.formatted ? parseFloat(usdcBalance.formatted) : 0;

  const storeCodeError = useMemo(() => {
    if (!storeCode) return undefined;
    if (!parsedCode) return 'Invalid store code format';
    if (storeError) return 'Store not found';
    return undefined;
  }, [storeCode, parsedCode, storeError]);

  const amountExceedsBalance = numericAmount > usdcBalanceNum;
  const isValidAmount = numericAmount > 0 && !amountExceedsBalance;
  const isValidStore = !!store && !storeError;
  const canPay = isValidAmount && isValidStore;

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleStoreCodeChange = (code: string) => {
    setStoreCode(code);
    if (store) {
      setIsEditing(true);
    }
  };

  const handleScanQR = () => {
    // TODO: Implement QR scanning
  };

  const handlePay = () => {
    // TODO: Implement payment transaction
  };

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar>
          <Button variant="secondary" onPress={handleScanQR} size="lg" className="h-14 rounded-xl">
            <Text>Scan QR</Text>
          </Button>

          <Button onPress={handlePay} disabled={!canPay} size="lg" className="h-14 rounded-xl">
            <Text>Pay</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-64">
        <FeatureHeader title="Pay" className="mb-6" />

        <PayStoreInfo
          storeName={store?.name ?? null}
          storeCode={storeCode}
          onChangeStoreCode={handleStoreCodeChange}
          onEditPress={handleEditPress}
          isEditing={isEditing}
          isLoading={storeLoading && !!parsedCode}
          error={storeCodeError}
          className="mb-4"
        />

        <View className="flex-1">
          <HeroAmountInput value={amount} onChangeText={setAmount} />

          <PayBalanceDisplay balance={usdcBalanceNum} isLoading={balanceLoading} />

          {amountExceedsBalance && numericAmount > 0 && (
            <Text variant="small" className="mt-2 text-center text-destructive">
              Insufficient balance
            </Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
