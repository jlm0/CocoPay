import { zeroAddress, parseUnits, type Address } from 'viem';
import { parseSuckerDeployerConfig, MappableAsset, USDC_ADDRESSES } from 'juice-sdk-core';
import type { StoreCreationParams } from '@/types/juicebox';
import type {
  REVConfig,
  REVDescription,
  REVStageConfig,
  REVLoanSource,
  REVSuckerDeploymentConfig,
  REVBuybackHookConfig,
  JBTerminalConfig,
  JBSplit,
} from '@/types/revnet';
import {
  OMNICHAIN_CHAIN_IDS,
  USDC_CURRENCY,
  USDC_DECIMALS,
  COCOPAY_ISSUANCE_CUT_PERCENT,
  type OmnichainChainId,
} from './constants';
import { getRevLoansAddress, getMultiTerminalAddress } from './revnet';
import {
  cashBackToReservedPercent,
  loyaltyBonusToWeightCutPercent,
  generateSalt,
} from './transforms';

const DEFAULT_INITIAL_ISSUANCE = parseUnits('1', 18);
const ISSUANCE_CUT_FREQUENCY = 7_776_000;
const ALLOW_SUCKERS_FLAG = 1 << 2;

export function buildRevnetDescription(
  params: StoreCreationParams,
  metadataCid: string,
  salt: `0x${string}`
): REVDescription {
  return {
    name: params.name,
    ticker: params.ticker.toUpperCase(),
    uri: `ipfs://${metadataCid}`,
    salt,
  };
}

export function buildRevnetStageConfig(
  params: StoreCreationParams,
  operatorAddress: Address
): REVStageConfig {
  const splitPercent = cashBackToReservedPercent(params.cashBackPercent);
  const issuanceCutPercent = loyaltyBonusToWeightCutPercent(COCOPAY_ISSUANCE_CUT_PERCENT);

  const splits: JBSplit[] = [
    {
      preferAddToBalance: false,
      percent: 1_000_000_000,
      projectId: 0n,
      beneficiary: operatorAddress,
      lockedUntil: 0,
      hook: zeroAddress,
    },
  ];

  return {
    startsAtOrAfter: 0,
    autoIssuances: [],
    splitPercent,
    splits,
    initialIssuance: DEFAULT_INITIAL_ISSUANCE,
    issuanceCutFrequency: ISSUANCE_CUT_FREQUENCY,
    issuanceCutPercent,
    cashOutTaxRate: 10,
    extraMetadata: ALLOW_SUCKERS_FLAG,
  };
}

export function buildRevnetLoanSources(chainId: OmnichainChainId): REVLoanSource[] {
  const terminalAddress = getMultiTerminalAddress(chainId);
  const usdcAddress = USDC_ADDRESSES[chainId] as Address;

  return [
    {
      token: usdcAddress,
      terminal: terminalAddress,
    },
  ];
}

export function buildRevnetConfig(
  params: StoreCreationParams,
  metadataCid: string,
  chainId: OmnichainChainId,
  salt: `0x${string}`,
  operatorAddress: Address
): REVConfig {
  const description = buildRevnetDescription(params, metadataCid, salt);
  const stageConfig = buildRevnetStageConfig(params, operatorAddress);
  const loanSources = buildRevnetLoanSources(chainId);
  const loansAddress = getRevLoansAddress(chainId);

  return {
    description,
    baseCurrency: USDC_CURRENCY,
    splitOperator: operatorAddress,
    stageConfigurations: [stageConfig],
    loanSources,
    loans: loansAddress,
  };
}

export function buildTerminalConfig(chainId: OmnichainChainId): JBTerminalConfig {
  const terminalAddress = getMultiTerminalAddress(chainId);
  const usdcAddress = USDC_ADDRESSES[chainId] as Address;

  return {
    terminal: terminalAddress,
    accountingContextsToAccept: [
      {
        token: usdcAddress,
        decimals: USDC_DECIMALS,
        currency: USDC_CURRENCY,
      },
    ],
  };
}

export function buildBuybackHookConfig(): REVBuybackHookConfig {
  return {
    dataHook: zeroAddress,
    hookToConfigure: zeroAddress,
    poolConfigurations: [],
  };
}

export function buildSuckerDeploymentConfig(
  targetChainId: OmnichainChainId,
  allChainIds: readonly OmnichainChainId[],
  salt: `0x${string}`
): REVSuckerDeploymentConfig {
  const peerChainIds = allChainIds.filter((id) => id !== targetChainId);

  if (peerChainIds.length === 0) {
    return {
      deployerConfigurations: [],
      salt,
    };
  }

  const config = parseSuckerDeployerConfig(targetChainId, [...peerChainIds], [MappableAsset.USDC]);

  return {
    deployerConfigurations: config.deployerConfigurations.map((dc) => ({
      deployer: dc.deployer as Address,
      mappings: dc.mappings.map((m) => ({
        localToken: m.localToken as Address,
        minGas: m.minGas,
        remoteToken: m.remoteToken as Address,
        minBridgeAmount: BigInt(m.minBridgeAmount),
      })),
    })),
    salt,
  };
}

export function buildOmnichainDeployArgs(
  params: StoreCreationParams,
  metadataCid: string,
  chainId: OmnichainChainId,
  salt: `0x${string}`,
  operatorAddress: Address
): {
  revnetId: bigint;
  configuration: REVConfig;
  terminalConfigurations: JBTerminalConfig[];
  buybackHookConfiguration: REVBuybackHookConfig;
  suckerDeploymentConfiguration: REVSuckerDeploymentConfig;
} {
  const configuration = buildRevnetConfig(params, metadataCid, chainId, salt, operatorAddress);
  const terminalConfigurations = [buildTerminalConfig(chainId)];
  const buybackHookConfiguration = buildBuybackHookConfig();
  const suckerDeploymentConfiguration = buildSuckerDeploymentConfig(
    chainId,
    OMNICHAIN_CHAIN_IDS,
    salt
  );

  return {
    revnetId: 0n,
    configuration,
    terminalConfigurations,
    buybackHookConfiguration,
    suckerDeploymentConfiguration,
  };
}

export { generateSalt };
