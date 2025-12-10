import { sepolia, baseSepolia, arbitrumSepolia, optimismSepolia } from 'viem/chains';
import { Network } from 'alchemy-sdk';

export const SUPPORTED_CHAINS = {
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
} as const;

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS]['id'];

export const CHAIN_TO_ALCHEMY_NETWORK: Record<SupportedChainId, Network> = {
  [sepolia.id]: Network.ETH_SEPOLIA,
  [baseSepolia.id]: Network.BASE_SEPOLIA,
  [arbitrumSepolia.id]: Network.ARB_SEPOLIA,
  [optimismSepolia.id]: Network.OPT_SEPOLIA,
};

export const DEFAULT_CHAIN = sepolia;
