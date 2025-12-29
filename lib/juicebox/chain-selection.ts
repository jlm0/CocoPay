import type { Address, Chain } from 'viem';
import { USDC_ADDRESSES, JBCoreContracts } from 'juice-sdk-core';
import {
  COCOPAY_CHAIN,
  COCOPAY_CHAIN_ID,
  OMNICHAIN_CHAINS,
  OMNICHAIN_CHAIN_IDS,
  type OmnichainChainId,
} from './constants';
import { getContractAddressForChain } from './contracts';

export function getPrimaryChain(): Chain {
  return COCOPAY_CHAIN;
}

export function getPrimaryChainId(): OmnichainChainId {
  return COCOPAY_CHAIN_ID;
}

export function getChainById(chainId: OmnichainChainId): Chain {
  const chain = OMNICHAIN_CHAINS.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(`Unknown chain ID: ${chainId}`);
  }
  return chain;
}

export function getChainWithSufficientBalance(
  requiredAmount: bigint,
  balancesByChain: Map<OmnichainChainId, bigint>
): OmnichainChainId | null {
  for (const chainId of OMNICHAIN_CHAIN_IDS) {
    const balance = balancesByChain.get(chainId) ?? 0n;
    if (balance >= requiredAmount) {
      return chainId;
    }
  }
  return null;
}

export function getChainWithHighestBalance(
  balancesByChain: Map<OmnichainChainId, bigint>
): OmnichainChainId {
  let highestChainId: OmnichainChainId = COCOPAY_CHAIN_ID;
  let highestBalance = 0n;

  for (const chainId of OMNICHAIN_CHAIN_IDS) {
    const balance = balancesByChain.get(chainId) ?? 0n;
    if (balance > highestBalance) {
      highestBalance = balance;
      highestChainId = chainId;
    }
  }

  return highestChainId;
}

export function getTotalBalance(balancesByChain: Map<OmnichainChainId, bigint>): bigint {
  let total = 0n;
  for (const balance of balancesByChain.values()) {
    total += balance;
  }
  return total;
}

export function isOmnichainChainId(chainId: number): chainId is OmnichainChainId {
  return (OMNICHAIN_CHAIN_IDS as readonly number[]).includes(chainId);
}

export function getUsdcAddress(chainId: OmnichainChainId): Address {
  return USDC_ADDRESSES[chainId] as Address;
}

export function getMultiTerminalAddress(chainId: OmnichainChainId): Address {
  return getContractAddressForChain(JBCoreContracts.JBMultiTerminal, chainId);
}
