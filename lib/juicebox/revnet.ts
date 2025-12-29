import type { Address } from 'viem';
import { jbContractAddress, getRevnetLoanContract } from 'juice-sdk-core';
import { JB_VERSION, OMNICHAIN_CHAIN_IDS, type OmnichainChainId } from './constants';

export const REV_DEPLOYER_ADDRESS = '0x2ca27bde7e7d33e353b44c27acfcf6c78dde251d' as Address;
export const JB_SUCKER_REGISTRY_ADDRESS = '0x07c8c5bf08f0361883728a8a5f8824ba5724ece3' as Address;

export function getRevDeployerAddress(chainId: OmnichainChainId): Address {
  const addresses = jbContractAddress[JB_VERSION]['REVDeployer'] as Record<number, Address>;
  return addresses[chainId] ?? REV_DEPLOYER_ADDRESS;
}

export function getRevLoansAddress(chainId: OmnichainChainId): Address {
  return getRevnetLoanContract(JB_VERSION, chainId);
}

export function getSuckerRegistryAddress(chainId: OmnichainChainId): Address {
  const addresses = jbContractAddress[JB_VERSION]['JBSuckerRegistry'] as Record<number, Address>;
  return addresses[chainId] ?? JB_SUCKER_REGISTRY_ADDRESS;
}

export function getMultiTerminalAddress(chainId: OmnichainChainId): Address {
  const addresses = jbContractAddress[JB_VERSION]['JBMultiTerminal'] as Record<number, Address>;
  return addresses[chainId];
}

export function isOmnichainChainId(chainId: number): chainId is OmnichainChainId {
  return (OMNICHAIN_CHAIN_IDS as readonly number[]).includes(chainId);
}

export const CHAIN_ID_TO_NAME: Record<OmnichainChainId, string> = {
  11155111: 'Sepolia',
  84532: 'Base Sepolia',
  421614: 'Arbitrum Sepolia',
  11155420: 'Optimism Sepolia',
};

export function getChainName(chainId: OmnichainChainId): string {
  return CHAIN_ID_TO_NAME[chainId];
}
