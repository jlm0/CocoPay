import type { Address } from 'viem';

export interface BendystrawProject {
  id: string;
  projectId: number;
  chainId: number;
  handle: string | null;
  deployer: Address;
  owner: Address;
  createdAt: number;
  metadataUri: string | null;
  contributorsCount: number;
  paymentsCount: number;
  volume: string;
  volumeUsd: string;
  balance: string;
  tokenSupply: string;
  trendingScore: string;
  trendingVolume: string;
  trendingPaymentsCount: number;
}

export interface BendystrawParticipant {
  id: string;
  projectId: number;
  chainId: number;
  address: Address;
  volume: string;
  volumeUsd: string;
  balance: string;
  stakedBalance: string;
  erc20Balance: string;
  lastPaidTimestamp: number;
}

export interface BendystrawPayEvent {
  id: string;
  projectId: number;
  chainId: number;
  timestamp: number;
  txHash: string;
  caller: Address;
  beneficiary: Address;
  amount: string;
  amountUsd: string;
  beneficiaryTokenCount: string;
  memo: string | null;
}

export interface BendystrawCashOutEvent {
  id: string;
  projectId: number;
  chainId: number;
  timestamp: number;
  txHash: string;
  holder: Address;
  beneficiary: Address;
  cashOutCount: string;
  reclaimAmount: string;
  reclaimAmountUsd: string;
  metadata: string | null;
}

export interface BendystrawActivityEvent {
  id: string;
  projectId: number;
  chainId: number;
  timestamp: number;
  txHash: string;
  caller: Address;
  from: Address;
  type: BendystrawActivityEventType;
}

export type BendystrawActivityEventType =
  | 'pay'
  | 'addToBalance'
  | 'burn'
  | 'cashOut'
  | 'mintTokens'
  | 'deployErc20'
  | 'projectCreate'
  | 'sendPayouts'
  | 'useAllowance'
  | 'borrowLoan'
  | 'repayLoan'
  | 'liquidateLoan';

export interface BendystrawProjectsQueryParams {
  where?: {
    projectId?: number;
    chainId?: number;
    owner?: Address;
    deployer?: Address;
  };
  orderBy?: 'createdAt' | 'volume' | 'trendingScore' | 'paymentsCount';
  orderDirection?: 'asc' | 'desc';
  limit?: number;
}

export interface BendystrawParticipantsQueryParams {
  projectId: number;
  chainId: number;
  orderBy?: 'volume' | 'balance' | 'lastPaidTimestamp';
  orderDirection?: 'asc' | 'desc';
  limit?: number;
}

export interface BendystrawActivityQueryParams {
  projectId: number;
  chainId: number;
  type?: BendystrawActivityEventType;
  limit?: number;
}

export interface BendystrawPayEventsQueryParams {
  projectId: number;
  chainId: number;
  limit?: number;
}

export interface BendystrawProjectsResponse {
  projects: {
    items: BendystrawProject[];
    totalCount: number;
  };
}

export interface BendystrawProjectResponse {
  project: BendystrawProject | null;
}

export interface BendystrawParticipantsResponse {
  participants: {
    items: BendystrawParticipant[];
    totalCount: number;
  };
}

export interface BendystrawPayEventsResponse {
  payEvents: {
    items: BendystrawPayEvent[];
    totalCount: number;
  };
}

export interface BendystrawActivityEventsResponse {
  activityEvents: {
    items: BendystrawActivityEvent[];
    totalCount: number;
  };
}
