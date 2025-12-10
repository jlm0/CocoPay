import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { HomeBalances } from '@/components/containers/HomeBalances';
import { HomeStores } from '@/components/containers/HomeStores';
import { PayButton } from '@/components/presentational/pay-button';
import { ScreenContainer } from '@/components/presentational/screen-container';

export default function HomePage() {
  const router = useRouter();

  const handlePayPress = () => {
    router.push('/(app)/pay');
  };

  return (
    <ScreenContainer>
      <HomeBalances />
      <HomeStores />
      <View className="pt-4">
        <PayButton onPress={handlePayPress} />
      </View>
    </ScreenContainer>
  );
}
