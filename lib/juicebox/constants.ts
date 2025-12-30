import type { Chain } from 'viem';
import {
  USDC_ADDRESSES,
  NATIVE_TOKEN,
  USD_CURRENCY_ID,
  ETH_CURRENCY_ID,
  ONE_ETHER,
  MAX_RESERVED_PERCENT,
  MAX_WEIGHT_CUT_PERCENT,
  JBDAO_CASHOUT_FEE_PERCENT,
  JB_CHAINS,
  JB_TOKEN_DECIMALS,
  SPLITS_TOTAL_PERCENT,
  DEFAULT_MEMO,
  DEFAULT_METADATA,
} from 'juice-sdk-core';
import {
  PRIMARY_CHAIN,
  PRIMARY_CHAIN_ID,
  NETWORK_CHAINS,
  NETWORK_CHAIN_IDS,
  type SupportedChainId,
} from '@/lib/network';

export const JB_VERSION = 5 as const;

export const COCOPAY_CHAIN: Chain = PRIMARY_CHAIN;
export const COCOPAY_CHAIN_ID = PRIMARY_CHAIN_ID;

export const OMNICHAIN_CHAINS: readonly Chain[] = NETWORK_CHAINS;
export const OMNICHAIN_CHAIN_IDS = NETWORK_CHAIN_IDS;
export type OmnichainChainId = SupportedChainId;

export const USDC_ADDRESS = USDC_ADDRESSES[COCOPAY_CHAIN_ID];
export const USDC_DECIMALS = 6;
export const USDC_CURRENCY = USD_CURRENCY_ID(JB_VERSION);

export const QUARTERLY_DURATION = 7_776_000;

export const CHAIN_PREFIXES: Record<number, string> = {
  1: 'eth',
  11155111: 'sep',
  10: 'opt',
  8453: 'base',
  42161: 'arb',
};

export const PREFIX_TO_CHAIN: Record<string, number> = {
  eth: 1,
  sep: 11155111,
  opt: 10,
  base: 8453,
  arb: 42161,
};

export {
  NATIVE_TOKEN,
  USD_CURRENCY_ID,
  ETH_CURRENCY_ID,
  ONE_ETHER,
  MAX_RESERVED_PERCENT,
  MAX_WEIGHT_CUT_PERCENT,
  JBDAO_CASHOUT_FEE_PERCENT,
  JB_CHAINS,
  JB_TOKEN_DECIMALS,
  SPLITS_TOTAL_PERCENT,
  DEFAULT_MEMO,
  DEFAULT_METADATA,
  USDC_ADDRESSES,
};
