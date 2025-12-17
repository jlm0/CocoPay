import type { StoreCreationParams, JBRulesetConfig, JBLaunchProjectConfig } from '@/types/juicebox';
import {
  MAX_RESERVED_PERCENT,
  MAX_WEIGHT_CUT_PERCENT,
  COCOPAY_CHAIN_ID,
  CHAIN_PREFIXES,
  PREFIX_TO_CHAIN,
} from './constants';
import {
  DEFAULT_WEIGHT,
  DEFAULT_RULESET_METADATA,
  getDefaultTerminalConfig,
  getDefaultRulesetDuration,
  getDefaultApprovalHook,
} from './config';

export function cashBackToReservedPercent(cashBackPercent: number): number {
  return Math.round(((100 - cashBackPercent) / 100) * MAX_RESERVED_PERCENT);
}

export function loyaltyBonusToWeightCutPercent(loyaltyBonusPercent: number): number {
  return Math.round((loyaltyBonusPercent / 100) * MAX_WEIGHT_CUT_PERCENT);
}

export function reservedPercentToCashBack(reservedPercent: number): number {
  return 100 - (reservedPercent / MAX_RESERVED_PERCENT) * 100;
}

export function weightCutPercentToLoyaltyBonus(weightCutPercent: number): number {
  return (weightCutPercent / MAX_WEIGHT_CUT_PERCENT) * 100;
}

export function buildRulesetConfig(params: StoreCreationParams): JBRulesetConfig {
  const reservedPercent = cashBackToReservedPercent(params.cashBackPercent);
  const weightCutPercent = loyaltyBonusToWeightCutPercent(params.loyaltyBonusPercent);

  return {
    mustStartAtOrAfter: 0,
    duration: getDefaultRulesetDuration(),
    weight: DEFAULT_WEIGHT,
    weightCutPercent,
    approvalHook: getDefaultApprovalHook(),
    metadata: {
      ...DEFAULT_RULESET_METADATA,
      reservedPercent,
    },
    splitGroups: [],
    fundAccessLimitGroups: [],
  };
}

export function buildLaunchProjectConfig(
  params: StoreCreationParams,
  projectUri: string
): JBLaunchProjectConfig {
  const rulesetConfig = buildRulesetConfig(params);

  return {
    projectUri,
    rulesetConfigurations: [rulesetConfig],
    terminalConfigurations: [getDefaultTerminalConfig()],
    memo: '',
  };
}

export function buildStoreCode(projectId: bigint, chainId: number = COCOPAY_CHAIN_ID): string {
  const prefix = CHAIN_PREFIXES[chainId] ?? 'sep';
  return `${prefix}:${projectId.toString()}`;
}

export function parseStoreCode(storeCode: string): { chainId: number; projectId: bigint } | null {
  const trimmed = storeCode.trim();
  if (!trimmed) return null;

  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    if (parts.length !== 2) return null;

    const [prefix, idStr] = parts;
    const chainId = PREFIX_TO_CHAIN[prefix];
    if (!chainId) return null;

    try {
      const projectId = BigInt(idStr);
      return { chainId, projectId };
    } catch {
      return null;
    }
  }

  try {
    const projectId = BigInt(trimmed);
    return { chainId: COCOPAY_CHAIN_ID, projectId };
  } catch {
    return null;
  }
}

export function generateSalt(): `0x${string}` {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return `0x${Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;
}
