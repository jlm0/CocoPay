import { useEffect, useRef, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { parseUnits, formatUnits } from 'viem';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { HeroAmountInput } from '@/components/presentational/hero-amount-input';
import { PayBalanceDisplay } from '@/components/presentational/pay-balance-display';
import { PayStoreInfo } from '@/components/presentational/pay-store-info';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useStoreDetails } from '@/hooks/useStoreDetails';
import { useMultiChainUsdcBalance } from '@/hooks/useMultiChainUsdcBalance';
import { useChainForPayment } from '@/hooks/useChainForPayment';
import { useStorePay } from '@/hooks/useStorePay';
import { useStoreInputLogic } from '@/hooks/useStoreInputLogic';
import { useAmountInputLogic } from '@/hooks/useAmountInputLogic';
import { useCocoPayProjectRegistry } from '@/hooks/useCocoPayProjectRegistry';
import { TOKEN_DECIMALS } from '@/lib/constants';
import { JB_TOKEN_DECIMALS } from '@/lib/juicebox/constants';
import { invalidateAfterPay } from '@/lib/query';
import type { DeepLinkResult } from '@/hooks/useDeepLinkSource';

export type PaySource = 'manual' | 'navigation' | 'qr' | 'deeplink';

type PayContainerProps = {
  routeStore?: string;
  routeStoreCode?: string;
  routeAmount?: string;
  routeSource?: PaySource;
  deepLink: DeepLinkResult;
};

export function PayContainer({
  routeStore,
  routeStoreCode,
  routeAmount,
  routeSource,
  deepLink,
}: PayContainerProps) {
  if (deepLink.status === 'pending') {
    return (
      <ScreenContainer
        bottomActionBar={
          <BottomActionBar>
            <Button variant="secondary" disabled size="lg" className="h-14 rounded-xl">
              <Text>Scan QR</Text>
            </Button>
            <Button disabled size="lg" className="h-14 rounded-xl">
              <Text>Pay</Text>
            </Button>
          </BottomActionBar>
        }>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-64">
          <FeatureHeader title="Pay" className="mb-6" />
          <Skeleton className="mb-4 h-20 w-full rounded-xl" />
          <View className="items-center">
            <Skeleton className="h-16 w-48 rounded-lg" />
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  const isDeepLink = deepLink.status === 'deeplink';
  const initialStoreCode = isDeepLink ? deepLink.params?.store : (routeStore ?? routeStoreCode);
  const initialAmount = isDeepLink ? deepLink.params?.amount : routeAmount;
  const source: PaySource =
    routeSource ?? (isDeepLink ? 'deeplink' : initialStoreCode ? 'navigation' : 'manual');
  const isFromExternal = source === 'qr' || source === 'deeplink';
  const deepLinkError = deepLink.error;

  return (
    <PayContainerContent
      initialStoreCode={initialStoreCode}
      initialAmount={initialAmount}
      isFromExternal={isFromExternal}
      deepLinkError={deepLinkError}
    />
  );
}

type PayContainerContentProps = {
  initialStoreCode?: string;
  initialAmount?: string;
  isFromExternal: boolean;
  deepLinkError: string | null;
};

function PayContainerContent({
  initialStoreCode,
  initialAmount,
  isFromExternal,
  deepLinkError,
}: PayContainerContentProps) {
  const router = useRouter();
  const prevStoreIdRef = useRef<string | null>(null);

  const { totalFormatted, isLoading: balanceLoading } = useMultiChainUsdcBalance();
  const usdcBalanceNum = parseFloat(totalFormatted) || 0;

  const storeInput = useStoreInputLogic({
    initialStoreCode,
    isFromExternal,
  });

  const projectId = storeInput.parsedCode?.projectId ?? 0n;

  const amountInput = useAmountInputLogic({
    initialAmount,
    balance: usdcBalanceNum,
    isFromExternal,
  });

  const amountInSmallestUnit = useMemo(() => {
    try {
      if (amountInput.numericAmount <= 0) return 0n;
      return parseUnits(amountInput.numericAmount.toString(), TOKEN_DECIMALS.USDC);
    } catch {
      return 0n;
    }
  }, [amountInput.numericAmount]);

  const { chainId: selectedChainId } = useChainForPayment(amountInSmallestUnit);

  const {
    pay: payStore,
    isLoading: isPayLoading,
    paymentStep,
    error: payError,
    reset: resetPayError,
  } = useStorePay(projectId, selectedChainId);

  const {
    store,
    isLoading: storeLoading,
    error: storeError,
  } = useStoreDetails(
    storeInput.parsedCode?.projectId ? Number(storeInput.parsedCode.projectId) : 0,
    storeInput.parsedCode?.chainId ?? 0
  );

  const { addProject } = useCocoPayProjectRegistry();

  const payButtonText = {
    idle: 'Pay',
    approving: 'Approving...',
    sending: 'Sending...',
    confirming: 'Confirming...',
  }[paymentStep];

  useEffect(() => {
    const currentStoreId = store?.id ?? null;
    const isNewStore = currentStoreId !== prevStoreIdRef.current;
    prevStoreIdRef.current = currentStoreId;

    if (store && isNewStore && storeInput.isEditing && !isFromExternal) {
      storeInput.setIsEditing(false);
    }
  }, [store, storeInput.isEditing, isFromExternal, storeInput]);

  const storeCodeError = (() => {
    if (storeInput.storeCodeError) return storeInput.storeCodeError;
    if (storeError) return 'Store not found';
    return undefined;
  })();

  const isValidStore = !!store && !storeError;
  const canPay = amountInput.isValidAmount && isValidStore && !isPayLoading;

  const handleStoreCodeChange = (code: string) => {
    storeInput.handleStoreCodeChange(code);
    resetPayError();
  };

  const handleStoreEditPress = () => {
    storeInput.setIsEditing(true);
  };

  const handleAmountEditPress = () => {
    amountInput.setIsEditing(true);
  };

  const handleScanQR = () => {
    router.push('/(app)/scan');
  };

  const handlePay = async () => {
    if (!canPay || !store || !storeInput.parsedCode) return;

    try {
      const amountInSmallestUnit = parseUnits(
        amountInput.numericAmount.toString(),
        TOKEN_DECIMALS.USDC
      );
      const result = await payStore({ amount: amountInSmallestUnit });

      await addProject({
        suckerGroupId: store.suckerGroupId,
        primaryChainId: storeInput.parsedCode.chainId,
        primaryProjectId: Number(storeInput.parsedCode.projectId),
      });

      invalidateAfterPay(Number(storeInput.parsedCode.projectId), storeInput.parsedCode.chainId);

      const cashBack = formatUnits(result.tokensReceived, JB_TOKEN_DECIMALS);

      router.push({
        pathname: '/(app)/pay/success',
        params: {
          txHash: result.txHash,
          amount: amountInput.numericAmount.toString(),
          storeName: store.name,
          tokenSymbol: store.tokenSymbol,
          cashBack,
        },
      });
    } catch {
      // Error is handled by the hook
    }
  };

  const showStoreAsDisplay = !!store && !storeInput.isEditing;
  const showStoreEditButton = !isFromExternal;
  const isAmountReadonly = isFromExternal && !!initialAmount && !amountInput.isEditing;

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
            {isPayLoading && <Spinner size="small" />}
            <Text>{payButtonText}</Text>
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
          storeCode={storeInput.storeCode}
          onChangeStoreCode={handleStoreCodeChange}
          onEditPress={handleStoreEditPress}
          isEditing={!showStoreAsDisplay}
          isLoading={storeLoading && !!storeInput.parsedCode}
          error={storeCodeError}
          showEditButton={showStoreEditButton}
          disabled={isPayLoading}
          className="mb-4"
        />

        <View className="flex-1">
          <HeroAmountInput
            value={amountInput.displayAmount}
            onChangeText={amountInput.handleAmountChange}
            isEditable={!isAmountReadonly}
            onEditPress={handleAmountEditPress}
            disabled={isPayLoading}
          />

          <PayBalanceDisplay balance={usdcBalanceNum} isLoading={balanceLoading} />

          {amountInput.amountExceedsBalance && amountInput.numericAmount > 0 && (
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
