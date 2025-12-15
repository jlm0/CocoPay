import { useState, useMemo, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { parseUnits } from 'viem';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { HeroAmountInput } from '@/components/presentational/hero-amount-input';
import { PayBalanceDisplay } from '@/components/presentational/pay-balance-display';
import { PayStoreInfo } from '@/components/presentational/pay-store-info';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { useStoreDetails } from '@/hooks/useStoreDetails';
import { useViemUsdcBalance } from '@/hooks/useViemUsdcBalance';
import { usePayWithApproval } from '@/hooks/usePayWithApproval';
import { parseStoreCode } from '@/lib/juicebox/transforms';
import { TOKEN_DECIMALS } from '@/lib/constants';

export type PaySource = 'manual' | 'navigation' | 'qr' | 'deeplink';

type PayContainerProps = {
  initialStoreCode?: string;
  initialAmount?: string;
  source?: PaySource;
  deepLinkError?: string | null;
};

export function PayContainer({
  initialStoreCode,
  initialAmount,
  source = 'manual',
  deepLinkError,
}: PayContainerProps) {
  const router = useRouter();
  const [storeCode, setStoreCode] = useState(initialStoreCode ?? '');
  const [amountRaw, setAmountRaw] = useState(initialAmount ?? '');
  const [isStoreEditing, setIsStoreEditing] = useState(!initialStoreCode);
  const [isAmountEditing, setIsAmountEditing] = useState(!initialAmount);

  const isFromExternal = source === 'qr' || source === 'deeplink';
  const displayAmount = amountRaw ? `$${amountRaw}` : '';

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

  const projectId = parsedCode?.projectId ?? 0n;
  const {
    pay,
    isLoading: isPayLoading,
    error: payError,
    reset: resetPayError,
  } = usePayWithApproval(projectId);

  useEffect(() => {
    if (store && !isStoreEditing && !isFromExternal) {
      setIsStoreEditing(false);
    }
  }, [store, isStoreEditing, isFromExternal]);

  const numericAmount = useMemo(() => {
    return parseFloat(amountRaw) || 0;
  }, [amountRaw]);

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
  const canPay = isValidAmount && isValidStore && !isPayLoading;

  const handleStoreEditPress = () => {
    setIsStoreEditing(true);
  };

  const handleAmountEditPress = () => {
    setIsAmountEditing(true);
  };

  const handleStoreCodeChange = (code: string) => {
    setStoreCode(code);
    resetPayError();
    if (store) {
      setIsStoreEditing(true);
    }
  };

  const handleAmountChange = (newAmount: string) => {
    const cleaned = newAmount.replace(/[$,]/g, '');
    setAmountRaw(cleaned);
    resetPayError();
  };

  const handleScanQR = () => {
    router.push('/(app)/scan');
  };

  const handlePay = async () => {
    if (!canPay || !store) return;

    try {
      const amountInSmallestUnit = parseUnits(numericAmount.toString(), TOKEN_DECIMALS.USDC);
      const result = await pay({ amount: amountInSmallestUnit });

      router.push({
        pathname: '/(app)/pay-success',
        params: {
          txHash: result.txHash,
          amount: numericAmount.toString(),
          storeName: store.name,
          tokensReceived: result.tokensReceived.toString(),
        },
      });
    } catch {
      // Error is handled by the hook
    }
  };

  const showStoreAsDisplay = !!store && !isStoreEditing;
  const showStoreEditButton = isFromExternal;
  const isAmountReadonly = isFromExternal && !!initialAmount && !isAmountEditing;

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar>
          <Button
            variant="secondary"
            onPress={handleScanQR}
            size="lg"
            className="h-14 rounded-xl"
            disabled={isPayLoading}>
            <Text>Scan QR</Text>
          </Button>

          <Button onPress={handlePay} disabled={!canPay} size="lg" className="h-14 rounded-xl">
            {isPayLoading ? <Spinner size="small" /> : <Text>Pay</Text>}
          </Button>
        </BottomActionBar>
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-64">
        <FeatureHeader title="Pay" className="mb-6" />

        {deepLinkError && (
          <View className="mx-4 mb-4 rounded-lg bg-destructive/10 p-3">
            <Text variant="small" className="text-center text-destructive">
              {deepLinkError}. Please enter payment details manually.
            </Text>
          </View>
        )}

        <PayStoreInfo
          storeName={store?.name ?? null}
          storeCode={storeCode}
          onChangeStoreCode={handleStoreCodeChange}
          onEditPress={handleStoreEditPress}
          isEditing={!showStoreAsDisplay}
          isLoading={storeLoading && !!parsedCode}
          error={storeCodeError}
          showEditButton={showStoreEditButton}
          className="mb-4"
        />

        <View className="flex-1">
          <HeroAmountInput
            value={displayAmount}
            onChangeText={handleAmountChange}
            isEditable={!isAmountReadonly}
            onEditPress={handleAmountEditPress}
          />

          <PayBalanceDisplay balance={usdcBalanceNum} isLoading={balanceLoading} />

          {amountExceedsBalance && numericAmount > 0 && (
            <Text variant="small" className="mt-2 text-center text-destructive">
              Insufficient balance
            </Text>
          )}

          {payError && (
            <Text variant="small" className="mt-2 text-center text-destructive">
              {payError.message}
            </Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
