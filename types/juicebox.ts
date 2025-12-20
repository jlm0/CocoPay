import type { Address, Hash } from 'viem';

export interface StoreAddress {
  formatted: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface StoreCreationParams {
  name: string;
  ticker: string;
  description?: string;
  logoUri?: string;
  address?: StoreAddress;
  website?: string;
  cashBackPercent: number;
  loyaltyBonusPercent: number;
}

export interface StoreCreationResult {
  projectId: bigint;
  storeCode: string;
  txHash: Hash;
}

export interface JBRuleset {
  cycleNumber: bigint;
  id: bigint;
  basedOnId: bigint;
  start: bigint;
  duration: bigint;
  weight: bigint;
  weightCutPercent: bigint;
  approvalHook: Address;
}

export interface JBRulesetMetadataState {
  reservedPercent: number;
  cashOutTaxRate: number;
  baseCurrency: number;
  pausePay: boolean;
  pauseCreditTransfers: boolean;
  allowOwnerMinting: boolean;
  allowTerminalMigration: boolean;
  allowSetTerminals: boolean;
  allowSetController: boolean;
  allowAddAccountingContext: boolean;
  allowAddPriceFeed: boolean;
  ownerMustSendPayouts: boolean;
  holdFees: boolean;
  useTotalSurplusForCashOuts: boolean;
  useDataHookForCashOut: boolean;
  dataHook: Address;
}

export interface JBProjectState {
  projectId: bigint;
  chainId: number;
  owner: Address;
  metadataUri: string;
  balance: bigint;
  totalSupply: bigint;
  surplus: bigint;
  ruleset: JBRuleset;
  rulesetMetadata: JBRulesetMetadataState;
}

export interface PayQuoteParams {
  projectId: bigint;
  paymentAmount: bigint;
}

export interface PayQuoteResult {
  paymentAmount: bigint;
  tokensToReceive: bigint;
  tokensReserved: bigint;
  totalTokensMinted: bigint;
  effectiveRate: number;
}

export interface PayParams {
  amount: bigint;
  memo?: string;
  beneficiary?: Address;
}

export interface PayResult {
  tokensReceived: bigint;
  txHash: Hash;
}

export interface CashOutQuoteParams {
  projectId: bigint;
  tokenAmount: bigint;
}

export interface CashOutQuoteResult {
  tokenAmount: bigint;
  grossAmount: bigint;
  cashOutTax: bigint;
  daoFee: bigint;
  netAmount: bigint;
  taxRate: number;
}

export interface CashOutParams {
  tokenAmount: bigint;
  minReceived: bigint;
  beneficiary?: Address;
}

export interface CashOutResult {
  amountReceived: bigint;
  txHash: Hash;
}

export interface LoanSource {
  token: Address;
  terminal: Address;
}

export interface Loan {
  id: bigint;
  amount: bigint;
  collateral: bigint;
  createdAt: number;
  prepaidFeePercent: number;
  prepaidDuration: number;
  source: LoanSource;
}

export interface LoanQuoteParams {
  projectId: bigint;
  collateralAmount: bigint;
}

export interface LoanQuoteResult {
  collateralAmount: bigint;
  borrowableAmount: bigint;
  minFeePercent: number;
  maxFeePercent: number;
}

export interface LoanBorrowParams {
  collateralAmount: bigint;
  minBorrowAmount: bigint;
  prepaidFeePercent: number;
  beneficiary?: Address;
}

export interface LoanBorrowResult {
  loan: Loan;
  txHash: Hash;
}

export interface LoanRepayParams {
  loanId: bigint;
  maxRepayAmount: bigint;
  collateralToReturn: bigint;
  beneficiary?: Address;
}

export interface LoanRepayResult {
  txHash: Hash;
}

export type TxStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

export interface TxState<T = unknown> {
  status: TxStatus;
  txHash?: Hash;
  data?: T;
  error?: Error;
}

export interface JBAccountingContext {
  token: Address;
  decimals: number;
  currency: number;
}

export interface JBTerminalConfig {
  terminal: Address;
  accountingContextsToAccept: JBAccountingContext[];
}

export interface JBRulesetConfig {
  mustStartAtOrAfter: number;
  duration: number;
  weight: bigint;
  weightCutPercent: number;
  approvalHook: Address;
  metadata: JBRulesetMetadataConfig;
  splitGroups: JBSplitGroup[];
  fundAccessLimitGroups: JBFundAccessLimitGroup[];
}

export interface JBRulesetMetadataConfig {
  reservedPercent: number;
  cashOutTaxRate: number;
  baseCurrency: number;
  pausePay: boolean;
  pauseCreditTransfers: boolean;
  allowOwnerMinting: boolean;
  allowSetCustomToken: boolean;
  allowTerminalMigration: boolean;
  allowSetTerminals: boolean;
  allowSetController: boolean;
  allowAddAccountingContext: boolean;
  allowAddPriceFeed: boolean;
  ownerMustSendPayouts: boolean;
  holdFees: boolean;
  useTotalSurplusForCashOuts: boolean;
  useDataHookForPay: boolean;
  useDataHookForCashOut: boolean;
  dataHook: Address;
  metadata: number;
}

export interface JBSplitGroup {
  groupId: bigint;
  splits: JBSplit[];
}

export interface JBSplit {
  percent: number;
  projectId: bigint;
  beneficiary: Address;
  preferAddToBalance: boolean;
  lockedUntil: number;
  hook: Address;
}

export interface JBFundAccessLimitGroup {
  terminal: Address;
  token: Address;
  payoutLimits: JBCurrencyAmount[];
  surplusAllowances: JBCurrencyAmount[];
}

export interface JBCurrencyAmount {
  amount: bigint;
  currency: number;
}

export interface JBLaunchProjectConfig {
  projectUri: string;
  rulesetConfigurations: JBRulesetConfig[];
  terminalConfigurations: JBTerminalConfig[];
  memo: string;
}
