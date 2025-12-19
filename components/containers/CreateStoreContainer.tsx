import { useState } from 'react';
import { ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { WizardStepIndicator } from '@/components/presentational/wizard-step-indicator';
import { StoreProfileForm } from '@/components/presentational/store-profile-form';
import { RewardsConfigForm } from '@/components/presentational/rewards-config-form';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useStoreCreationForm } from '@/hooks/useStoreCreationForm';
import { useJBProjectCreate } from '@/hooks/juicebox';
import { useCocoPayProjectRegistry } from '@/hooks/useCocoPayProjectRegistry';
import { uploadFile } from '@/lib/pinata';
import { COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';
import { queryKeys } from '@/lib/query';
import { HEX_COLORS } from '@/lib/theme';

export function CreateStoreContainer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [createError, setCreateError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useStoreCreationForm();
  const { createProject, isLoading: isCreating } = useJBProjectCreate();
  const { addProject } = useCocoPayProjectRegistry();

  const isLoading = isUploading || isCreating;

  const handleNext = () => {
    setCreateError(null);
    form.goToNextStep();
  };

  const handleBack = () => {
    setCreateError(null);
    form.goToPrevStep();
  };

  const handleCreate = async () => {
    try {
      setCreateError(null);
      let logoUri: string | undefined;

      if (form.state.logoUri) {
        setIsUploading(true);
        const fileName = form.state.logoUri.split('/').pop() ?? 'logo.jpg';
        const uploadResult = await uploadFile(
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
        setIsUploading(false);
      }

      const tickerSymbol = form.state.ticker.replace(/^\$/, '').toUpperCase();

      const result = await createProject({
        name: form.state.name.trim(),
        ticker: tickerSymbol,
        description: form.state.description.trim() || undefined,
        tagline: form.state.tagline.trim() || undefined,
        logoUri,
        address: form.state.address ?? undefined,
        website: form.state.website.trim() || undefined,
        cashBackPercent: form.state.cashBack,
        loyaltyBonusPercent: form.state.loyaltyBonus,
      });

      await addProject({
        projectId: Number(result.projectId),
        chainId: COCOPAY_CHAIN_ID,
      });

      await queryClient.invalidateQueries({ queryKey: queryKeys.bendystraw.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.projectMetadata.all });

      const storeId = `${COCOPAY_CHAIN_ID}-${result.projectId.toString()}`;

      router.replace({
        pathname: '/(app)/create/success',
        params: {
          name: form.state.name.trim(),
          storeId,
        },
      });
    } catch (err) {
      setIsUploading(false);
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create store. Please try again.'
      );
    }
  };

  const canProceed = form.step === 1 ? form.isStep1Valid : form.isStep2Valid;
  const buttonText = form.step === 1 ? 'Next' : isLoading ? '' : 'Create';

  return (
    <ScreenContainer
      horizontalPadding={false}
      bottomActionBar={
        <BottomActionBar>
          {createError && <Text className="mb-3 text-center text-destructive">{createError}</Text>}
          <Button
            onPress={form.step === 1 ? handleNext : handleCreate}
            disabled={!canProceed || isLoading}
            size="lg"
            className="h-14 rounded-xl">
            {isLoading ? (
              <ActivityIndicator color={HEX_COLORS.background} />
            ) : (
              <Text>{buttonText}</Text>
            )}
          </Button>
        </BottomActionBar>
      }>
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 pb-64"
        keyboardShouldPersistTaps="handled">
        {form.step === 2 && (
          <Pressable onPress={handleBack} className="mb-2 flex-row items-center">
            <Icon as={ChevronLeft} className="text-foreground" size={20} />
            <Text className="text-foreground">Back</Text>
          </Pressable>
        )}

        <FeatureHeader title="Create a store" />

        <WizardStepIndicator currentStep={form.step} totalSteps={2} className="mb-2" />

        {form.step === 1 && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
            <StoreProfileForm
              name={form.state.name}
              description={form.state.description}
              tagline={form.state.tagline}
              logoUri={form.state.logoUri}
              address={form.state.address}
              website={form.state.website}
              onNameChange={(v) => form.updateField('name', v)}
              onDescriptionChange={(v) => form.updateField('description', v)}
              onTaglineChange={(v) => form.updateField('tagline', v)}
              onLogoChange={(v) => form.updateField('logoUri', v)}
              onAddressChange={(v) => form.updateField('address', v)}
              onWebsiteChange={(v) => form.updateField('website', v)}
              errors={form.errors}
            />
          </Animated.View>
        )}

        {form.step === 2 && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
            <RewardsConfigForm
              ticker={form.state.ticker}
              cashBack={form.state.cashBack}
              loyaltyBonus={form.state.loyaltyBonus}
              onTickerChange={(v) => form.updateField('ticker', v)}
              onCashBackChange={(v) => form.updateField('cashBack', v)}
              onLoyaltyBonusChange={(v) => form.updateField('loyaltyBonus', v)}
              errors={form.errors}
            />
          </Animated.View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
