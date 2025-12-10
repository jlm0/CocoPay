import type { Address } from 'viem';
import { jbContractAddress, JBCoreContracts } from 'juice-sdk-core';
import { JB_VERSION, COCOPAY_CHAIN_ID } from './constants';

type JBContractAddresses = typeof jbContractAddress;
type V5Contracts = keyof JBContractAddresses[5];

export function getContractAddress(contract: V5Contracts): Address {
  return jbContractAddress[JB_VERSION][contract][COCOPAY_CHAIN_ID] as Address;
}

export const JB_CONTROLLER_ADDRESS = getContractAddress(JBCoreContracts.JBController);
export const JB_MULTI_TERMINAL_ADDRESS = getContractAddress(JBCoreContracts.JBMultiTerminal);
export const JB_DIRECTORY_ADDRESS = getContractAddress(JBCoreContracts.JBDirectory);
export const JB_PROJECTS_ADDRESS = getContractAddress(JBCoreContracts.JBProjects);
export const JB_RULESETS_ADDRESS = getContractAddress(JBCoreContracts.JBRulesets);
export const JB_TOKENS_ADDRESS = getContractAddress(JBCoreContracts.JBTokens);
export const JB_SPLITS_ADDRESS = getContractAddress(JBCoreContracts.JBSplits);
export const JB_TERMINAL_STORE_ADDRESS = getContractAddress(JBCoreContracts.JBTerminalStore);
export const JB_PERMISSIONS_ADDRESS = getContractAddress(JBCoreContracts.JBPermissions);

export const CONTRACTS = {
  controller: JB_CONTROLLER_ADDRESS,
  multiTerminal: JB_MULTI_TERMINAL_ADDRESS,
  directory: JB_DIRECTORY_ADDRESS,
  projects: JB_PROJECTS_ADDRESS,
  rulesets: JB_RULESETS_ADDRESS,
  tokens: JB_TOKENS_ADDRESS,
  splits: JB_SPLITS_ADDRESS,
  terminalStore: JB_TERMINAL_STORE_ADDRESS,
  permissions: JB_PERMISSIONS_ADDRESS,
} as const;

export { JBCoreContracts };
