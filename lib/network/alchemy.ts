import type { Chain } from 'viem';
import { Network } from 'alchemy-sdk';
import {
  sepolia as alchemySepolia,
  baseSepolia as alchemyBaseSepolia,
  arbitrumSepolia as alchemyArbitrumSepolia,
  optimismSepolia as alchemyOptimismSepolia,
  mainnet as alchemyMainnet,
  base as alchemyBase,
  arbitrum as alchemyArbitrum,
  optimism as alchemyOptimism,
} from '@account-kit/infra';
import { IS_MAINNET } from './config';
import type { TestnetChainId, MainnetChainId, SupportedChainId } from './chains';

const TESTNET_RPC_PREFIX: Record<TestnetChainId, string> = {
  11155111: 'eth-sepolia',
  84532: 'base-sepolia',
  421614: 'arb-sepolia',
  11155420: 'opt-sepolia',
};

const MAINNET_RPC_PREFIX: Record<MainnetChainId, string> = {
  1: 'eth-mainnet',
  8453: 'base-mainnet',
  42161: 'arb-mainnet',
  10: 'opt-mainnet',
};

export const CHAIN_RPC_PREFIX: Record<SupportedChainId, string> = IS_MAINNET
  ? (MAINNET_RPC_PREFIX as Record<SupportedChainId, string>)
  : (TESTNET_RPC_PREFIX as Record<SupportedChainId, string>);

const TESTNET_ALCHEMY_NETWORK: Record<TestnetChainId, Network> = {
  11155111: Network.ETH_SEPOLIA,
  84532: Network.BASE_SEPOLIA,
  421614: Network.ARB_SEPOLIA,
  11155420: Network.OPT_SEPOLIA,
};

const MAINNET_ALCHEMY_NETWORK: Record<MainnetChainId, Network> = {
  1: Network.ETH_MAINNET,
  8453: Network.BASE_MAINNET,
  42161: Network.ARB_MAINNET,
  10: Network.OPT_MAINNET,
};

export const CHAIN_TO_ALCHEMY_NETWORK: Record<SupportedChainId, Network> = IS_MAINNET
  ? (MAINNET_ALCHEMY_NETWORK as Record<SupportedChainId, Network>)
  : (TESTNET_ALCHEMY_NETWORK as Record<SupportedChainId, Network>);

const TESTNET_ALCHEMY_AA_CHAINS: Record<TestnetChainId, Chain> = {
  11155111: alchemySepolia,
  84532: alchemyBaseSepolia,
  421614: alchemyArbitrumSepolia,
  11155420: alchemyOptimismSepolia,
};

const MAINNET_ALCHEMY_AA_CHAINS: Record<MainnetChainId, Chain> = {
  1: alchemyMainnet,
  8453: alchemyBase,
  42161: alchemyArbitrum,
  10: alchemyOptimism,
};

export const ALCHEMY_AA_CHAINS: Record<SupportedChainId, Chain> = IS_MAINNET
  ? (MAINNET_ALCHEMY_AA_CHAINS as Record<SupportedChainId, Chain>)
  : (TESTNET_ALCHEMY_AA_CHAINS as Record<SupportedChainId, Chain>);
