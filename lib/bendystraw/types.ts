import type { Address } from 'viem';
import type {
  project,
  participant,
  payEvent,
  activityEvent,
  activityEventType,
  projectFilter,
  participantFilter,
  payEventFilter,
  activityEventFilter,
} from './generated/schema';

export type { projectFilter, participantFilter, payEventFilter, activityEventFilter };

export type BendystrawProject = Pick<
  project,
  | 'id'
  | 'projectId'
  | 'chainId'
  | 'handle'
  | 'deployer'
  | 'owner'
  | 'createdAt'
  | 'metadataUri'
  | 'contributorsCount'
  | 'paymentsCount'
  | 'volume'
  | 'volumeUsd'
  | 'balance'
  | 'tokenSupply'
  | 'trendingScore'
  | 'trendingVolume'
  | 'trendingPaymentsCount'
>;

export type BendystrawParticipant = Pick<
  participant,
  | 'address'
  | 'projectId'
  | 'chainId'
  | 'volume'
  | 'volumeUsd'
  | 'balance'
  | 'creditBalance'
  | 'erc20Balance'
  | 'lastPaidTimestamp'
>;

export type BendystrawPayEvent = Pick<
  payEvent,
  | 'id'
  | 'projectId'
  | 'chainId'
  | 'timestamp'
  | 'txHash'
  | 'caller'
  | 'beneficiary'
  | 'amount'
  | 'amountUsd'
  | 'newlyIssuedTokenCount'
  | 'memo'
>;

export type BendystrawActivityEvent = Pick<
  activityEvent,
  'id' | 'projectId' | 'chainId' | 'timestamp' | 'txHash' | 'from' | 'type'
>;

export type BendystrawActivityEventType = activityEventType;

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

export interface BendystrawProjectsQueryParams {
  where?: projectFilter;
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
