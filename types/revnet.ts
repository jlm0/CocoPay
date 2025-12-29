import type { Address, Hash } from 'viem';

export interface REVDescription {
  name: string;
  ticker: string;
  uri: string;
  salt: `0x${string}`;
}

export interface REVAutoIssuance {
  chainId: number;
  count: bigint;
  beneficiary: Address;
}

export interface REVLoanSource {
  token: Address;
  terminal: Address;
}

export interface JBSplit {
  preferAddToBalance: boolean;
  percent: number;
  projectId: bigint;
  beneficiary: Address;
  lockedUntil: number;
  hook: Address;
}

export interface REVStageConfig {
  startsAtOrAfter: number;
  autoIssuances: REVAutoIssuance[];
  splitPercent: number;
  splits: JBSplit[];
  initialIssuance: bigint;
  issuanceCutFrequency: number;
  issuanceCutPercent: number;
  cashOutTaxRate: number;
  extraMetadata: number;
}

export interface REVConfig {
  description: REVDescription;
  baseCurrency: number;
  splitOperator: Address;
  stageConfigurations: REVStageConfig[];
  loanSources: REVLoanSource[];
  loans: Address;
}

export interface JBTokenMapping {
  localToken: Address;
  minGas: number;
  remoteToken: Address;
  minBridgeAmount: bigint;
}

export interface JBSuckerDeployerConfig {
  deployer: Address;
  mappings: JBTokenMapping[];
}

export interface REVSuckerDeploymentConfig {
  deployerConfigurations: JBSuckerDeployerConfig[];
  salt: `0x${string}`;
}

export interface JBTerminalConfig {
  terminal: Address;
  accountingContextsToAccept: {
    token: Address;
    decimals: number;
    currency: number;
  }[];
}

export interface REVBuybackHookConfig {
  dataHook: Address;
  hookToConfigure: Address;
  poolConfigurations: {
    token: Address;
    fee: number;
    twapWindow: number;
  }[];
}

export interface OmnichainDeployResult {
  chainId: number;
  projectId: bigint;
  txHash: Hash;
  status: 'pending' | 'success' | 'error';
  error?: Error;
}

export interface OmnichainRevnetCreationResult {
  projectId: bigint;
  results: OmnichainDeployResult[];
  storeCode: string;
}

export const EXTRA_METADATA_ALLOW_SUCKERS = 1 << 2;
