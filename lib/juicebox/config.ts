import { parseUnits, zeroAddress, type Address } from 'viem';
import type {
  JBRulesetMetadataConfig,
  JBTerminalConfig,
  JBAccountingContext,
} from '@/types/juicebox';
import { USDC_ADDRESS, USDC_DECIMALS, USDC_CURRENCY, QUARTERLY_DURATION } from './constants';
import { JB_MULTI_TERMINAL_ADDRESS } from './contracts';

export const DEFAULT_WEIGHT = parseUnits('1', 18);

export const DEFAULT_RULESET_METADATA: JBRulesetMetadataConfig = {
  reservedPercent: 0,
  cashOutTaxRate: 1000,
  baseCurrency: USDC_CURRENCY,
  pausePay: false,
  pauseCreditTransfers: false,
  allowOwnerMinting: false,
  allowSetCustomToken: false,
  allowTerminalMigration: false,
  allowSetTerminals: false,
  allowSetController: false,
  allowAddAccountingContext: false,
  allowAddPriceFeed: false,
  ownerMustSendPayouts: false,
  holdFees: false,
  useTotalSurplusForCashOuts: true,
  useDataHookForPay: false,
  useDataHookForCashOut: false,
  dataHook: zeroAddress,
  metadata: 0,
};

export const USDC_ACCOUNTING_CONTEXT: JBAccountingContext = {
  token: USDC_ADDRESS as Address,
  decimals: USDC_DECIMALS,
  currency: USDC_CURRENCY,
};

export function getDefaultTerminalConfig(): JBTerminalConfig {
  return {
    terminal: JB_MULTI_TERMINAL_ADDRESS,
    accountingContextsToAccept: [USDC_ACCOUNTING_CONTEXT],
  };
}

export function getDefaultRulesetDuration(): number {
  return QUARTERLY_DURATION;
}

export function getDefaultApprovalHook(): Address {
  return zeroAddress;
}
