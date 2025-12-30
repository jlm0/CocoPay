import { Alchemy } from 'alchemy-sdk';
import type { Chain } from 'viem';
import { CHAIN_RPC_PREFIX, CHAIN_TO_ALCHEMY_NETWORK, type SupportedChainId } from '@/lib/network';

const ALCHEMY_API_KEY = process.env.EXPO_PUBLIC_ALCHEMY_API_KEY || '';
const GAS_POLICY_ID = process.env.EXPO_PUBLIC_ALCHEMY_GAS_POLICY_ID || '';

if (!ALCHEMY_API_KEY) {
  console.warn(
    'EXPO_PUBLIC_ALCHEMY_API_KEY is not set. Please add it to your environment variables.'
  );
}

export const getAlchemyRpcUrl = (chain: Chain): string => {
  const prefix = CHAIN_RPC_PREFIX[chain.id as SupportedChainId];

  if (!prefix) {
    throw new Error(`Unsupported chain: ${chain.id}`);
  }

  return `https://${prefix}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
};

export const getAlchemyInstance = (chainId: SupportedChainId): Alchemy => {
  return new Alchemy({
    apiKey: ALCHEMY_API_KEY,
    network: CHAIN_TO_ALCHEMY_NETWORK[chainId],
  });
};

export { ALCHEMY_API_KEY, GAS_POLICY_ID };
