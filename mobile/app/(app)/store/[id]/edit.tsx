import { useLocalSearchParams } from 'expo-router';
import { EditStoreContainer } from '@/components/containers/EditStoreContainer';
import { parseStoreCode } from '@/lib/juicebox/transforms';
import { COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';

export default function EditStorePage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const parsedId = (() => {
    if (!id) return { chainId: COCOPAY_CHAIN_ID, projectId: 0 };
    if (id.includes('-')) {
      return {
        chainId: parseInt(id.split('-')[0], 10),
        projectId: parseInt(id.split('-')[1], 10),
      };
    }
    if (id.includes(':')) {
      const parsed = parseStoreCode(id);
      if (parsed) {
        return { chainId: parsed.chainId, projectId: Number(parsed.projectId) };
      }
    }
    return { chainId: COCOPAY_CHAIN_ID, projectId: parseInt(id, 10) };
  })();

  return <EditStoreContainer projectId={parsedId.projectId} chainId={parsedId.chainId} />;
}
