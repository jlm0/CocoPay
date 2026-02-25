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
import { IS_MAINNET } from './network/config';
import type { SupportedChainId } from './network/chains';

type ChainUIConfig = {
  color: string;
  colorMuted: string;
};

const ETHEREUM_UI: ChainUIConfig = {
  color: '#627EEA',
  colorMuted: 'rgba(98, 126, 234, 0.15)',
};

const BASE_UI: ChainUIConfig = {
  color: '#0052FF',
  colorMuted: 'rgba(0, 82, 255, 0.15)',
};

const ARBITRUM_UI: ChainUIConfig = {
  color: '#12AAFF',
  colorMuted: 'rgba(18, 170, 255, 0.15)',
};

const OPTIMISM_UI: ChainUIConfig = {
  color: '#FF0420',
  colorMuted: 'rgba(255, 4, 32, 0.15)',
};

const TESTNET_CHAIN_UI: Record<number, ChainUIConfig> = {
  [sepolia.id]: ETHEREUM_UI,
  [baseSepolia.id]: BASE_UI,
  [arbitrumSepolia.id]: ARBITRUM_UI,
  [optimismSepolia.id]: OPTIMISM_UI,
};

const MAINNET_CHAIN_UI: Record<number, ChainUIConfig> = {
  [mainnet.id]: ETHEREUM_UI,
  [base.id]: BASE_UI,
  [arbitrum.id]: ARBITRUM_UI,
  [optimism.id]: OPTIMISM_UI,
};

const CHAIN_UI_MAP: Record<number, ChainUIConfig> = IS_MAINNET
  ? MAINNET_CHAIN_UI
  : TESTNET_CHAIN_UI;

export function getChainColor(chainId: SupportedChainId): string {
  return CHAIN_UI_MAP[chainId]?.color ?? '#627EEA';
}

export function getChainColorMuted(chainId: SupportedChainId): string {
  return CHAIN_UI_MAP[chainId]?.colorMuted ?? 'rgba(98, 126, 234, 0.15)';
}
