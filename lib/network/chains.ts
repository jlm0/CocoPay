import type { Chain } from 'viem';
import {
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  mainnet,
  base,
  arbitrum,
  optimism,
} from 'viem/chains';
import { IS_MAINNET } from './config';

export const TESTNET_CHAINS = [sepolia, baseSepolia, arbitrumSepolia, optimismSepolia] as const;
export const TESTNET_CHAIN_IDS = [
  sepolia.id,
  baseSepolia.id,
  arbitrumSepolia.id,
  optimismSepolia.id,
] as const;

export const MAINNET_CHAINS = [mainnet, base, arbitrum, optimism] as const;
export const MAINNET_CHAIN_IDS = [mainnet.id, base.id, arbitrum.id, optimism.id] as const;

export type TestnetChainId = (typeof TESTNET_CHAIN_IDS)[number];
export type MainnetChainId = (typeof MAINNET_CHAIN_IDS)[number];
export type NetworkChainId = TestnetChainId | MainnetChainId;

export const NETWORK_CHAINS: readonly Chain[] = IS_MAINNET ? MAINNET_CHAINS : TESTNET_CHAINS;
export const NETWORK_CHAIN_IDS = IS_MAINNET ? MAINNET_CHAIN_IDS : TESTNET_CHAIN_IDS;
export type SupportedChainId = (typeof NETWORK_CHAIN_IDS)[number];

export const PRIMARY_CHAIN: Chain = IS_MAINNET ? mainnet : sepolia;
export const PRIMARY_CHAIN_ID = PRIMARY_CHAIN.id as SupportedChainId;

const TESTNET_CHAIN_NAMES: Record<TestnetChainId, string> = {
  [sepolia.id]: 'Ethereum Sepolia',
  [baseSepolia.id]: 'Base Sepolia',
  [arbitrumSepolia.id]: 'Arbitrum Sepolia',
  [optimismSepolia.id]: 'Optimism Sepolia',
};

const MAINNET_CHAIN_NAMES: Record<MainnetChainId, string> = {
  [mainnet.id]: 'Ethereum',
  [base.id]: 'Base',
  [arbitrum.id]: 'Arbitrum',
  [optimism.id]: 'Optimism',
};

export const CHAIN_NAMES: Record<SupportedChainId, string> = IS_MAINNET
  ? (MAINNET_CHAIN_NAMES as Record<SupportedChainId, string>)
  : (TESTNET_CHAIN_NAMES as Record<SupportedChainId, string>);

const TESTNET_CHAIN_BY_ID: Record<TestnetChainId, Chain> = {
  [sepolia.id]: sepolia,
  [baseSepolia.id]: baseSepolia,
  [arbitrumSepolia.id]: arbitrumSepolia,
  [optimismSepolia.id]: optimismSepolia,
};

const MAINNET_CHAIN_BY_ID: Record<MainnetChainId, Chain> = {
  [mainnet.id]: mainnet,
  [base.id]: base,
  [arbitrum.id]: arbitrum,
  [optimism.id]: optimism,
};

export const CHAIN_BY_ID: Record<SupportedChainId, Chain> = IS_MAINNET
  ? (MAINNET_CHAIN_BY_ID as Record<SupportedChainId, Chain>)
  : (TESTNET_CHAIN_BY_ID as Record<SupportedChainId, Chain>);

export function isNetworkChainId(chainId: number): chainId is SupportedChainId {
  return (NETWORK_CHAIN_IDS as readonly number[]).includes(chainId);
}
