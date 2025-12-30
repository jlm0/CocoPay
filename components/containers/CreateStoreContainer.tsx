import { useEffect, useCallback } from 'react';
import { ScrollView, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { WizardStepIndicator } from '@/components/presentational/wizard-step-indicator';
import { StoreProfileForm } from '@/components/presentational/store-profile-form';
import { RewardsConfigForm } from '@/components/presentational/rewards-config-form';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { OmnichainDeployProgress } from '@/components/presentational/omnichain-deploy-progress';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useStoreCreationForm } from '@/hooks/useStoreCreationForm';
import { useOmnichainRevnetCreate } from '@/hooks/juicebox/useOmnichainRevnetCreate';
import { useCocoPayProjectRegistry } from '@/hooks/useCocoPayProjectRegistry';
import { uploadFileWithRetry } from '@/lib/pinata';
import { COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';
import { refetchAfterStoreCreate } from '@/lib/query';

export function CreateStoreContainer() {
  const router = useRouter();

  const form = useStoreCreationForm();
  const {
    createRevnet,
    status: deployStatus,
    chainResults,
    error: deployError,
    reset: resetDeploy,
  } = useOmnichainRevnetCreate();
  const { addProject } = useCocoPayProjectRegistry();

  const isLoading = deployStatus === 'uploading' || deployStatus === 'deploying';

  const handleNext = () => {
    resetDeploy();
    form.goToNextStep();
  };

  const handleBack = useCallback(() => {
    resetDeploy();
    form.goToPrevStep();
  }, [resetDeploy, form]);

  const handleBackPress = useCallback(() => {
    if (isLoading) return true;

    if (form.step === 2) {
      handleBack();
      return true;
    }

    return false;
  }, [form.step, isLoading, handleBack]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [handleBackPress]);

  const handleCreate = async () => {
    try {
      resetDeploy();
      let logoUri: string | undefined;

      if (form.state.logoUri) {
        console.log('[CreateStore] Uploading logo...', { uri: form.state.logoUri });
        const fileName = form.state.logoUri.split('/').pop() ?? 'logo.jpg';
        const uploadResult = await uploadFileWithRetry(
          {
            uri: form.state.logoUri,
            type: 'image/jpeg',
            name: fileName,
          },
          {
            name: `${form.state.name.trim()}-logo`,
            keyvalues: { app: 'cocopay', type: 'store-logo' },
          }
        );
        logoUri = `ipfs://${uploadResult.cid}`;
        console.log('[CreateStore] Logo uploaded:', logoUri);
      }

      const tickerSymbol = form.state.ticker.replace(/^\$/, '').toUpperCase();
      console.log('[CreateStore] Creating omnichain revnet...', {
        name: form.state.name.trim(),
        ticker: tickerSymbol,
        logoUri,
      });

      const result = await createRevnet({
        name: form.state.name.trim(),
        ticker: tickerSymbol,
        description: form.state.description.trim() || undefined,
        logoUri,
        address: form.state.address ?? undefined,
        website: form.state.website.trim() || undefined,
        cashBackPercent: form.state.cashBack,
      });
      console.log('[CreateStore] Revnet created:', result);

      await addProject({
        projectId: Number(result.projectId),
        chainId: COCOPAY_CHAIN_ID,
      });

      await refetchAfterStoreCreate();

      const storeId = `${COCOPAY_CHAIN_ID}-${result.projectId.toString()}`;

      router.replace({
        pathname: '/(app)/create/success',
        params: {
          name: form.state.name.trim(),
          storeId,
        },
      });
    } catch (err) {
      console.error('[CreateStore] Error:', err);
    }
  };

  const canProceed = form.step === 1 ? form.isStep1Valid : form.isStep2Valid;
  const buttonText = form.step === 1 ? 'Next' : 'Create';

  return (
    <ScreenContainer
      horizontalPadding={false}
      bottomActionBar={
        <BottomActionBar onBack={form.step === 2 && !isLoading ? handleBack : undefined}>
          {isLoading && (
            <OmnichainDeployProgress
              chainResults={chainResults}
              isUploading={deployStatus === 'uploading'}
              className="mb-4"
            />
          )}
          {deployError && (
            <Text className="mb-3 text-center text-destructive">{deployError.message}</Text>
          )}
          <Button
            onPress={form.step === 1 ? handleNext : handleCreate}
            disabled={!canProceed || isLoading}
            size="lg"
            className="h-14 rounded-xl">
            <Text>{buttonText}</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 pb-64"
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none">
        <FeatureHeader title="Create a store" />

        <WizardStepIndicator currentStep={form.step} className="mb-2" />

        {form.step === 1 && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
            <StoreProfileForm
              name={form.state.name}
              description={form.state.description}
              logoUri={form.state.logoUri}
              address={form.state.address}
              website={form.state.website}
              onNameChange={(v) => form.updateField('name', v)}
              onDescriptionChange={(v) => form.updateField('description', v)}
              onLogoChange={(v) => form.updateField('logoUri', v)}
              onAddressChange={(v) => form.updateField('address', v)}
              onWebsiteChange={(v) => form.updateField('website', v)}
              errors={form.errors}
              disabled={isLoading}
            />
          </Animated.View>
        )}

        {form.step === 2 && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
            <RewardsConfigForm
              ticker={form.state.ticker}
              cashBack={form.state.cashBack}
              onTickerChange={(v) => form.updateField('ticker', v)}
              onCashBackChange={(v) => form.updateField('cashBack', v)}
              errors={form.errors}
              disabled={isLoading}
            />
          </Animated.View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
