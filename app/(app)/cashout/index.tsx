import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CashOutContainer } from '@/components/containers/CashOutContainer';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { Text } from '@/components/ui/text';

export default function CashOutPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    projectId: string;
    chainId: string;
    storeName: string;
    tokenSymbol: string;
    balance: string;
  }>();

  if (!params.projectId || !params.chainId || !params.tokenSymbol || !params.balance) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-destructive">Missing store information</Text>
          <Text variant="caption" className="mt-2 text-primary" onPress={() => router.back()}>
            Go back
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <CashOutContainer
      projectId={parseInt(params.projectId, 10)}
      chainId={parseInt(params.chainId, 10)}
      storeName={params.storeName ?? 'Store'}
      tokenSymbol={params.tokenSymbol}
      balance={parseFloat(params.balance)}
    />
  );
}
