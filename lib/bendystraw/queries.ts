import { gql } from 'graphql-request';
import type {
  BendystrawProjectsQueryParams,
  BendystrawParticipantsQueryParams,
  BendystrawActivityQueryParams,
  BendystrawPayEventsQueryParams,
  BendystrawProjectsResponse,
  BendystrawProjectResponse,
  BendystrawParticipantsResponse,
  BendystrawPayEventsResponse,
  BendystrawActivityEventsResponse,
} from './types';
import { getBendystrawClient, getNetworkFromChainId } from './client';

const PROJECT_FIELDS = `
  id
  projectId
  chainId
  handle
  deployer
  owner
  createdAt
  metadataUri
  contributorsCount
  paymentsCount
  volume
  volumeUsd
  balance
  balanceUsd
  tokenSupply
  trendingScore
  trendingVolume
  trendingPaymentsCount
`;

const PARTICIPANT_FIELDS = `
  id
  projectId
  chainId
  address
  volume
  volumeUsd
  balance
  stakedBalance
  erc20Balance
  lastPaidTimestamp
`;

const PAY_EVENT_FIELDS = `
  id
  projectId
  chainId
  timestamp
  txHash
  caller
  beneficiary
  amount
  amountUsd
  beneficiaryTokenCount
  memo
`;

const ACTIVITY_EVENT_FIELDS = `
  id
  projectId
  chainId
  timestamp
  txHash
  caller
  from
  type
`;

export async function fetchProject(
  projectId: number,
  chainId: number
): Promise<BendystrawProjectResponse['project']> {
  const client = getBendystrawClient(getNetworkFromChainId(chainId));

  const query = gql`
    query GetProject($projectId: Int!, $chainId: Int!) {
      project(projectId: $projectId, chainId: $chainId) {
        ${PROJECT_FIELDS}
      }
    }
  `;

  const data = await client.request<BendystrawProjectResponse>(query, {
    projectId,
    chainId,
  });

  return data.project;
}

export async function fetchProjects(
  params: BendystrawProjectsQueryParams = {}
): Promise<BendystrawProjectsResponse['projects']> {
  const chainId = params.where?.chainId ?? 11155111;
  const client = getBendystrawClient(getNetworkFromChainId(chainId));

  const query = gql`
    query GetProjects(
      $where: ProjectFilter
      $orderBy: String
      $orderDirection: String
      $limit: Int
    ) {
      projects(
        where: $where
        orderBy: $orderBy
        orderDirection: $orderDirection
        limit: $limit
      ) {
        items {
          ${PROJECT_FIELDS}
        }
        totalCount
      }
    }
  `;

  const data = await client.request<BendystrawProjectsResponse>(query, {
    where: params.where,
    orderBy: params.orderBy,
    orderDirection: params.orderDirection,
    limit: params.limit ?? 50,
  });

  return data.projects;
}

export async function fetchParticipants(
  params: BendystrawParticipantsQueryParams
): Promise<BendystrawParticipantsResponse['participants']> {
  const client = getBendystrawClient(getNetworkFromChainId(params.chainId));

  const query = gql`
    query GetParticipants(
      $where: ParticipantFilter
      $orderBy: String
      $orderDirection: String
      $limit: Int
    ) {
      participants(
        where: $where
        orderBy: $orderBy
        orderDirection: $orderDirection
        limit: $limit
      ) {
        items {
          ${PARTICIPANT_FIELDS}
        }
        totalCount
      }
    }
  `;

  const data = await client.request<BendystrawParticipantsResponse>(query, {
    where: {
      projectId: params.projectId,
      chainId: params.chainId,
    },
    orderBy: params.orderBy ?? 'balance',
    orderDirection: params.orderDirection ?? 'desc',
    limit: params.limit ?? 50,
  });

  return data.participants;
}

export async function fetchPayEvents(
  params: BendystrawPayEventsQueryParams
): Promise<BendystrawPayEventsResponse['payEvents']> {
  const client = getBendystrawClient(getNetworkFromChainId(params.chainId));

  const query = gql`
    query GetPayEvents($where: PayEventFilter, $limit: Int) {
      payEvents(where: $where, orderBy: "timestamp", orderDirection: "desc", limit: $limit) {
        items {
          ${PAY_EVENT_FIELDS}
        }
        totalCount
      }
    }
  `;

  const data = await client.request<BendystrawPayEventsResponse>(query, {
    where: {
      projectId: params.projectId,
      chainId: params.chainId,
    },
    limit: params.limit ?? 50,
  });

  return data.payEvents;
}

export async function fetchActivityEvents(
  params: BendystrawActivityQueryParams
): Promise<BendystrawActivityEventsResponse['activityEvents']> {
  const client = getBendystrawClient(getNetworkFromChainId(params.chainId));

  const query = gql`
    query GetActivityEvents($where: ActivityEventFilter, $limit: Int) {
      activityEvents(where: $where, orderBy: "timestamp", orderDirection: "desc", limit: $limit) {
        items {
          ${ACTIVITY_EVENT_FIELDS}
        }
        totalCount
      }
    }
  `;

  const whereClause: Record<string, unknown> = {
    projectId: params.projectId,
    chainId: params.chainId,
  };

  if (params.type) {
    whereClause.type = params.type;
  }

  const data = await client.request<BendystrawActivityEventsResponse>(query, {
    where: whereClause,
    limit: params.limit ?? 50,
  });

  return data.activityEvents;
}
