import type { Chain } from 'viem';
import { sepolia, baseSepolia, arbitrumSepolia, optimismSepolia } from 'viem/chains';
import { Network } from 'alchemy-sdk';
import {
  OMNICHAIN_CHAINS,
  OMNICHAIN_CHAIN_IDS,
  COCOPAY_CHAIN,
  type OmnichainChainId,
} from './juicebox/constants';

export const SUPPORTED_CHAINS = {
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
} as const;

export const SUPPORTED_CHAINS_ARRAY: Chain[] = OMNICHAIN_CHAINS;

export type SupportedChainId = OmnichainChainId;

export const CHAIN_BY_ID: Record<SupportedChainId, Chain> = {
  [sepolia.id]: sepolia,
  [baseSepolia.id]: baseSepolia,
  [arbitrumSepolia.id]: arbitrumSepolia,
  [optimismSepolia.id]: optimismSepolia,
};

export const CHAIN_TO_ALCHEMY_NETWORK: Record<SupportedChainId, Network> = {
  [sepolia.id]: Network.ETH_SEPOLIA,
  [baseSepolia.id]: Network.BASE_SEPOLIA,
  [arbitrumSepolia.id]: Network.ARB_SEPOLIA,
  [optimismSepolia.id]: Network.OPT_SEPOLIA,
};

export const DEFAULT_CHAIN = COCOPAY_CHAIN;

export { OMNICHAIN_CHAINS, OMNICHAIN_CHAIN_IDS, type OmnichainChainId };
