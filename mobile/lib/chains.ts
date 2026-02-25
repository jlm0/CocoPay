import type { Chain } from 'viem';
import {
  NETWORK_CHAINS,
  PRIMARY_CHAIN,
  PRIMARY_CHAIN_ID,
  CHAIN_BY_ID as NETWORK_CHAIN_BY_ID,
  CHAIN_TO_ALCHEMY_NETWORK as NETWORK_CHAIN_TO_ALCHEMY,
  type SupportedChainId,
} from '@/lib/network';
import { OMNICHAIN_CHAINS, OMNICHAIN_CHAIN_IDS, type OmnichainChainId } from './juicebox/constants';

export const SUPPORTED_CHAINS_ARRAY: readonly Chain[] = NETWORK_CHAINS;

export { type SupportedChainId };

export const CHAIN_BY_ID: Record<SupportedChainId, Chain> = NETWORK_CHAIN_BY_ID;

export const CHAIN_TO_ALCHEMY_NETWORK = NETWORK_CHAIN_TO_ALCHEMY;

export const DEFAULT_CHAIN: Chain = PRIMARY_CHAIN;
export const DEFAULT_CHAIN_ID = PRIMARY_CHAIN_ID;

export { OMNICHAIN_CHAINS, OMNICHAIN_CHAIN_IDS, type OmnichainChainId };
