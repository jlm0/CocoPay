import { useEffect, useCallback, useMemo, useState } from 'react';
import { ScrollView, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { WizardStepIndicator } from '@/components/presentational/wizard-step-indicator';
import { StoreProfileForm } from '@/components/presentational/store-profile-form';
import { RewardsConfigForm } from '@/components/presentational/rewards-config-form';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { useStoreCreationForm } from '@/hooks/useStoreCreationForm';
import { useStoreCreation } from '@/lib/contexts/store-creation-context';
import { uploadFileWithRetry } from '@/lib/pinata';

export function CreateStoreContainer() {
  const router = useRouter();
  const form = useStoreCreationForm();
  const { setCreationParams } = useStoreCreation();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);

  const handleNext = () => {
    setUploadError(null);
    form.goToNextStep();
  };

  const handleBack = useCallback(() => {
    setUploadError(null);
    form.goToPrevStep();
  }, [form]);

  const handleBackPress = useCallback(() => {
    if (isUploading) return true;

    if (form.step === 2) {
      handleBack();
      return true;
    }

    return false;
  }, [form.step, isUploading, handleBack]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [handleBackPress]);

  const handleWebsiteChange = useCallback(
    (value: string) => {
      const sanitized = form.sanitizeWebsite(value);
      form.updateField('website', sanitized);
    },
    [form]
  );

  const handleStep1FieldBlur = useCallback(
    (field: 'name' | 'description' | 'website') => {
      form.markTouched(field);
    },
    [form]
  );

  const handleStep2FieldBlur = useCallback(
    (field: 'ticker') => {
      form.markTouched(field);
    },
    [form]
  );

  const handleCreate = async () => {
    try {
      setIsUploading(true);
      setUploadError(null);

      let logoUri: string | undefined;

      if (form.state.logoUri) {
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
      }

      const tickerSymbol = form.state.ticker.replace(/^\$/, '').toUpperCase();
      const websiteUrl = form.state.website ? `https://${form.state.website}` : undefined;

      setCreationParams({
        name: form.state.name.trim(),
        ticker: tickerSymbol,
        description: form.state.description.trim() || undefined,
        logoUri,
        address: form.state.address ?? undefined,
        website: websiteUrl,
        cashBackPercent: form.state.cashBack,
      });

      router.replace('/(app)/create/status');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload logo');
      setUploadError(error);
      console.error('[CreateStore] Error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const canProceed = form.step === 1 ? form.isStep1Valid : form.isStep2Valid;

  const buttonText = useMemo(() => {
    if (form.step === 1) return 'Next';
    if (isUploading) return 'Uploading...';
    return 'Create';
  }, [form.step, isUploading]);

  return (
    <ScreenContainer
      horizontalPadding={false}
      bottomActionBar={
        <BottomActionBar onBack={form.step === 2 && !isUploading ? handleBack : undefined}>
          {uploadError && (
            <Text className="mb-3 text-center text-destructive">{uploadError.message}</Text>
          )}
          <Button
            onPress={form.step === 1 ? handleNext : handleCreate}
            disabled={!canProceed || isUploading}
            size="lg"
            className="h-14 flex-row items-center gap-2">
            {isUploading && <Spinner size="small" />}
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
              onWebsiteChange={handleWebsiteChange}
              onFieldBlur={handleStep1FieldBlur}
              errors={form.visibleErrors}
              disabled={isUploading}
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
              onFieldBlur={handleStep2FieldBlur}
              errors={form.visibleErrors}
              disabled={isUploading}
            />
          </Animated.View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
