import { useState, useMemo } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { HEX_COLORS } from '@/lib/theme';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { StepsList } from '@/components/presentational/steps-list';
import { NameInput, NAME_MAX_LENGTH } from '@/components/presentational/name-input';
import { TickerInput, TICKER_MAX_LENGTH } from '@/components/presentational/ticker-input';
import { PercentageSlider } from '@/components/presentational/percentage-slider';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useJBProjectCreate } from '@/hooks/juicebox';
import { useCocoPayProjectRegistry } from '@/hooks/useCocoPayProjectRegistry';
import { COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';
import { queryKeys } from '@/lib/query';

function getTickerSymbol(ticker: string): string {
  return ticker.replace(/^\$/, '');
}

export default function CreateStorePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [cashBack, setCashBack] = useState(4);
  const [loyaltyBonus, setLoyaltyBonus] = useState(2);
  const [createError, setCreateError] = useState<string | null>(null);

  const { createProject, isLoading } = useJBProjectCreate();
  const { addProject } = useCocoPayProjectRegistry();

  const tickerSymbol = getTickerSymbol(ticker);

  const nameWarning = useMemo(() => {
    if (name.length > NAME_MAX_LENGTH) {
      return `Name should be ${NAME_MAX_LENGTH} characters or less`;
    }
    return undefined;
  }, [name]);

  const tickerWarning = useMemo(() => {
    if (tickerSymbol.length > TICKER_MAX_LENGTH) {
      return `Ticker should be ${TICKER_MAX_LENGTH} characters or less`;
    }
    return undefined;
  }, [tickerSymbol]);

  const isValid =
    name.length > 0 &&
    name.length <= NAME_MAX_LENGTH &&
    tickerSymbol.length > 0 &&
    tickerSymbol.length <= TICKER_MAX_LENGTH;

  const handleCreate = async () => {
    try {
      const result = await createProject({
        name: name.trim(),
        ticker: tickerSymbol.toUpperCase(),
        cashBackPercent: cashBack,
        loyaltyBonusPercent: loyaltyBonus,
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
          name: name.trim(),
          storeId,
        },
      });
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create store. Please try again.'
      );
    }
  };

  return (
    <ScreenContainer
      horizontalPadding={false}
      bottomActionBar={
        <BottomActionBar>
          {createError && <Text className="mb-3 text-center text-destructive">{createError}</Text>}
          <Button
            onPress={handleCreate}
            disabled={!isValid || isLoading}
            size="lg"
            className="h-14 rounded-xl">
            {isLoading ? <ActivityIndicator color={HEX_COLORS.background} /> : <Text>Create</Text>}
          </Button>
        </BottomActionBar>
      }>
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 pb-64">
        <FeatureHeader title="Create a store" />

        <StepsList
          title="How Coco works"
          steps={[
            'Your USDC revenue starts issuing your stablecoin 1:1.',
            'USDC revenue stays in CocoPay, you receive your coins.',
            'Your coins can be cashed out for USDC at any time.',
            'Use cash back to send a % of your issued coins to payers.',
            "Your coin's issuance can be set to decrease each quarter, rewarding early and loyal customers as your coin grows.",
          ]}
          className="mb-2"
        />

        <NameInput
          value={name}
          onChangeText={(text) => {
            setName(text);
            setCreateError(null);
          }}
          warning={nameWarning}
        />

        <TickerInput
          value={ticker}
          onChangeText={(text) => {
            setTicker(text);
            setCreateError(null);
          }}
          warning={tickerWarning}
        />

        <PercentageSlider
          label="Cash back"
          description="Send your stablecoin back to customers as they pay in."
          value={cashBack}
          onValueChange={setCashBack}
          minPercent={0}
          maxPercent={10}
        />

        <PercentageSlider
          label="Loyalty bonus"
          description="Each quarter your stablecoin costs slightly more to make."
          value={loyaltyBonus}
          onValueChange={setLoyaltyBonus}
          minPercent={0}
          maxPercent={5}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
