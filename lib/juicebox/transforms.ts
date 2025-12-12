import type { StoreCreationParams, JBRulesetConfig, JBLaunchProjectConfig } from '@/types/juicebox';
import { MAX_RESERVED_PERCENT, MAX_WEIGHT_CUT_PERCENT, COCOPAY_CHAIN_ID } from './constants';
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

export function buildStoreCode(projectId: bigint): string {
  return `coco:${COCOPAY_CHAIN_ID}:${projectId.toString()}`;
}

export function parseStoreCode(storeCode: string): { chainId: number; projectId: bigint } | null {
  const parts = storeCode.split(':');
  if (parts.length !== 3 || parts[0] !== 'coco') {
    return null;
  }

  const chainId = parseInt(parts[1], 10);
  const projectId = BigInt(parts[2]);

  if (isNaN(chainId)) {
    return null;
  }

  return { chainId, projectId };
}

export function generateSalt(): `0x${string}` {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return `0x${Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;
}
