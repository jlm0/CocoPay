import { useLocalSearchParams } from 'expo-router';
import { CashOutContainer } from '@/components/containers/CashOutContainer';

export default function CashOutPage() {
  const params = useLocalSearchParams<{
    projectId?: string;
    chainId?: string;
    storeName?: string;
    tokenSymbol?: string;
    balance?: string;
  }>();

  return (
    <CashOutContainer
      projectId={params.projectId}
      chainId={params.chainId}
      storeName={params.storeName}
      tokenSymbol={params.tokenSymbol}
      balance={params.balance}
    />
  );
}
