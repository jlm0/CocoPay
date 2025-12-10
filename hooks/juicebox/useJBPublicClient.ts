import { useViemPublicClient } from '@/hooks/useViemPublicClient';
import { COCOPAY_CHAIN } from '@/lib/juicebox/constants';

export function useJBPublicClient() {
  return useViemPublicClient(COCOPAY_CHAIN);
}
