import { useLocalSearchParams } from 'expo-router';
import { BorrowContainer } from '@/components/containers/BorrowContainer';

export default function BorrowPage() {
  const params = useLocalSearchParams<{
    projectId: string;
    chainId: string;
    storeName: string;
    tokenSymbol: string;
    balance: string;
  }>();

  return (
    <BorrowContainer
      projectId={params.projectId}
      chainId={params.chainId}
      storeName={params.storeName}
      tokenSymbol={params.tokenSymbol}
      balance={params.balance}
    />
  );
}
