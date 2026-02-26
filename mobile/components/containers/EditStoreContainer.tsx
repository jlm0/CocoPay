import { useEffect, useCallback, useState } from 'react';
import { ScrollView, BackHandler, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { CircleCheck, CloudUpload } from 'lucide-react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { StoreProfileForm } from '@/components/presentational/store-profile-form';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { ErrorRetryState } from '@/components/presentational/error-retry-state';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useStoreEditForm } from '@/hooks/useStoreEditForm';
import { useStoreUpdate } from '@/hooks/useStoreUpdate';
import { useStoreDetails } from '@/hooks/useStoreDetails';
import { getStoredProjectSync } from '@/lib/storage/cocopay-projects';
import { fetchMetadataFromIPFS } from '@/lib/juicebox/metadata';
import { resolveIpfsUri } from '@/lib/pinata';

interface EditStoreContainerProps {
  projectId: number;
  chainId: number;
}

type LoadingState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; error: Error };

export function EditStoreContainer({ projectId, chainId }: EditStoreContainerProps) {
  const router = useRouter();
  const {
    store,
    baseStore,
    isLoading: storeLoading,
    error: storeError,
  } = useStoreDetails(projectId, chainId);
  const form = useStoreEditForm();
  const { updateStore, state: updateState } = useStoreUpdate();

  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'loading' });
  const [newLogoFile, setNewLogoFile] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);
  const [formInitialized, setFormInitialized] = useState(false);

  useEffect(() => {
    if (formInitialized || storeLoading) return;

    const loadExistingData = async () => {
      try {
        const storedProject = getStoredProjectSync(projectId, chainId);

        if (storedProject?.creationParams) {
          const params = storedProject.creationParams;
          const resolvedLogo = params.logoUri ? (resolveIpfsUri(params.logoUri) ?? null) : null;
          const websiteWithoutProtocol = params.website?.replace(/^https?:\/\//, '') ?? '';

          form.setValues({
            name: params.name,
            description: params.description ?? '',
            logoUri: resolvedLogo,
            address: params.address ?? null,
            website: websiteWithoutProtocol,
          });
          setFormInitialized(true);
          setLoadingState({ status: 'ready' });
          return;
        }

        if (storedProject?.metadataCid) {
          const metadata = await fetchMetadataFromIPFS(storedProject.metadataCid);
          if (metadata.cocopay) {
            const resolvedLogo = metadata.logoUri
              ? (resolveIpfsUri(metadata.logoUri) ?? null)
              : null;
            const websiteWithoutProtocol = metadata.infoUri?.replace(/^https?:\/\//, '') ?? '';

            form.setValues({
              name: metadata.name,
              description: metadata.description ?? '',
              logoUri: resolvedLogo,
              address: metadata.cocopay.address ?? null,
              website: websiteWithoutProtocol,
            });
            setFormInitialized(true);
            setLoadingState({ status: 'ready' });
            return;
          }
        }

        if (store || baseStore) {
          const storeData = store ?? baseStore;
          if (storeData) {
            const resolvedLogo = storeData.logoUri
              ? (resolveIpfsUri(storeData.logoUri) ?? null)
              : null;
            const websiteValue =
              'website' in storeData ? (storeData.website?.replace(/^https?:\/\//, '') ?? '') : '';

            form.setValues({
              name: storeData.name,
              description: storeData.description ?? '',
              logoUri: resolvedLogo,
              address: storeData.address ?? null,
              website: websiteValue,
            });
            setFormInitialized(true);
            setLoadingState({ status: 'ready' });
            return;
          }
        }

        if (!storeLoading) {
          setLoadingState({
            status: 'error',
            error: new Error('Unable to load store data for editing.'),
          });
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load store data');
        setLoadingState({ status: 'error', error });
      }
    };

    loadExistingData();
  }, [projectId, chainId, store, baseStore, storeLoading, formInitialized, form]);

  const handleBackPress = useCallback(() => {
    if (updateState.status === 'uploading') return true;
    return false;
  }, [updateState.status]);

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

  const handleFieldBlur = useCallback(
    (field: 'name' | 'description' | 'website') => {
      form.markTouched(field);
    },
    [form]
  );

  const handleLogoChange = useCallback(
    (uri: string | null) => {
      form.updateField('logoUri', uri);
      if (uri) {
        const fileName = uri.split('/').pop() ?? 'logo.jpg';
        setNewLogoFile({ uri, type: 'image/jpeg', name: fileName });
      } else {
        setNewLogoFile(null);
      }
    },
    [form]
  );

  const handleSave = async () => {
    try {
      const websiteUrl = form.state.website ? `https://${form.state.website}` : undefined;

      await updateStore(
        projectId,
        chainId,
        {
          name: form.state.name.trim(),
          description: form.state.description.trim() || undefined,
          logoUri: form.state.logoUri ?? undefined,
          address: form.state.address ?? undefined,
          website: websiteUrl,
        },
        newLogoFile ?? undefined
      );
    } catch {
      // Error handled in hook state
    }
  };

  const handleViewStore = useCallback(() => {
    router.back();
  }, [router]);

  const handleRetryLoad = useCallback(() => {
    setFormInitialized(false);
    setLoadingState({ status: 'loading' });
  }, []);

  const canSave = form.isValid && form.hasChanges;
  const isUpdating = updateState.status === 'uploading';
  const isSuccess = updateState.status === 'success';
  const hasUpdateError = updateState.status === 'error';

  if (loadingState.status === 'loading' || storeLoading) {
    return (
      <ScreenContainer>
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-6 pb-64">
          <FeatureHeader title="Edit store" />
          <View className="items-center py-4">
            <Skeleton className="mb-6 size-24" />
          </View>
          <Skeleton className="h-14" />
          <Skeleton className="h-24" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (loadingState.status === 'error' || storeError) {
    const error = loadingState.status === 'error' ? loadingState.error : storeError;
    return (
      <ErrorRetryState
        title="Unable to load store"
        message={error?.message ?? 'An error occurred while loading store data.'}
        onRetry={handleRetryLoad}
        onBack={() => router.back()}
        header={<FeatureHeader title="Edit store" />}
      />
    );
  }

  if (isSuccess) {
    return (
      <ScreenContainer
        bottomActionBar={
          <BottomActionBar showBackButton={false}>
            <Button onPress={handleViewStore} size="lg" className="h-14">
              <Text>Back to Store</Text>
            </Button>
          </BottomActionBar>
        }>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={ZoomIn.springify().damping(12)} className="mb-6">
            <Icon as={CircleCheck} size={80} className="text-primary" />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(400)} className="mb-2">
            <Text variant="title" className="text-center">
              Store Updated
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <Text variant="caption" className="text-center">
              Your changes have been saved
            </Text>
          </Animated.View>
        </View>
      </ScreenContainer>
    );
  }

  if (isUpdating) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={FadeIn.duration(300)} className="items-center">
            <View className="mb-6 h-16 w-16 items-center justify-center bg-muted">
              <Icon as={CloudUpload} size={32} className="text-primary" />
            </View>
            <Text variant="heading" className="mb-2 text-center">
              Updating store...
            </Text>
            <Text variant="caption" className="text-center">
              Uploading your changes
            </Text>
          </Animated.View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      horizontalPadding={false}
      bottomActionBar={
        <BottomActionBar onBack={() => router.back()}>
          {hasUpdateError && (
            <Text className="mb-3 text-center text-destructive">{updateState.error.message}</Text>
          )}
          <Button onPress={handleSave} disabled={!canSave || isUpdating} size="lg" className="h-14">
            <Text>Save Changes</Text>
          </Button>
        </BottomActionBar>
      }>
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 pb-64"
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none">
        <FeatureHeader title="Edit store" />

        <Animated.View entering={FadeIn.duration(200)}>
          <StoreProfileForm
            name={form.state.name}
            description={form.state.description}
            logoUri={form.state.logoUri}
            address={form.state.address}
            website={form.state.website}
            onNameChange={(v) => form.updateField('name', v)}
            onDescriptionChange={(v) => form.updateField('description', v)}
            onLogoChange={handleLogoChange}
            onAddressChange={(v) => form.updateField('address', v)}
            onWebsiteChange={handleWebsiteChange}
            onFieldBlur={handleFieldBlur}
            errors={form.visibleErrors}
            disabled={isUpdating}
          />
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
