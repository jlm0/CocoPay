import { useState } from 'react';
import { ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { HEX_COLORS } from '@/lib/theme';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { StepsList } from '@/components/presentational/steps-list';
import { NameInput } from '@/components/presentational/name-input';
import { TickerInput } from '@/components/presentational/ticker-input';
import { PercentageSlider } from '@/components/presentational/percentage-slider';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useJBProjectCreate } from '@/hooks/juicebox';

export default function CreateStorePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [cashBack, setCashBack] = useState(4);
  const [loyaltyBonus, setLoyaltyBonus] = useState(2);

  const { createProject, isLoading } = useJBProjectCreate();

  const isValid = name.length > 0 && ticker.length > 1;

  const handleCreate = async () => {
    try {
      const result = await createProject({
        name,
        ticker: ticker.toUpperCase(),
        cashBackPercent: cashBack,
        loyaltyBonusPercent: loyaltyBonus,
      });

      Alert.alert(
        'Store Created!',
        `Your store "${name}" has been created.\n\nStore Code: ${result.storeCode}`,
        [
          {
            text: 'View Store',
            onPress: () => router.replace(`/store/${result.projectId.toString()}`),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        'Creation Failed',
        err instanceof Error ? err.message : 'Failed to create store. Please try again.'
      );
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <ScreenContainer horizontalPadding={false}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <FeatureHeader title="Create a store" className="mb-6" />

        <StepsList
          title="How Coco works"
          steps={[
            'Your USDC revenue starts issuing your stablecoin 1:1.',
            'USDC revenue stays in CocoPay, you receive your coins.',
            'Your coins can be cashed out for USDC at any time.',
            'Use cash back to send a % of your issued coins to payers.',
            "Your coin's issuance can be set to decrease each quarter, rewarding early and loyal customers as your coin grows.",
          ]}
          className="mb-8"
        />

        <NameInput value={name} onChangeText={setName} className="mb-6" />

        <TickerInput value={ticker} onChangeText={setTicker} className="mb-6" />

        <PercentageSlider
          label="Cash back"
          description="Send your stablecoin back to customers as they pay in."
          value={cashBack}
          onValueChange={setCashBack}
          minPercent={0}
          maxPercent={10}
          className="mb-6"
        />

        <PercentageSlider
          label="Loyalty bonus"
          description="Each quarter your stablecoin costs slightly more to make."
          value={loyaltyBonus}
          onValueChange={setLoyaltyBonus}
          minPercent={0}
          maxPercent={5}
          className="mb-8"
        />

        <Button onPress={handleCreate} disabled={!isValid || isLoading} className="h-14 rounded-xl">
          {isLoading ? (
            <ActivityIndicator color={HEX_COLORS.background} />
          ) : (
            <Text className="font-sans-semibold text-primary-foreground">Create</Text>
          )}
        </Button>

        <Button variant="ghost" size="icon" onPress={handleBackPress} className="my-4 self-center">
          <Icon as={ChevronDown} size={32} className="text-primary" />
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}
