import { gql } from 'graphql-request';
import type {
  BendystrawProjectsQueryParams,
  BendystrawParticipantsQueryParams,
  BendystrawActivityQueryParams,
  BendystrawPayEventsQueryParams,
  BendystrawParticipantParams,
  BendystrawParticipantsByAddressParams,
  BendystrawParticipant,
  BendystrawProjectsResponse,
  BendystrawProjectResponse,
  BendystrawParticipantsResponse,
  BendystrawPayEventsResponse,
  BendystrawActivityEventsResponse,
  BendystrawParticipantsByAddressResponse,
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
  metadata
  domain
  tags
  contributorsCount
  paymentsCount
  volume
  volumeUsd
  balance
  tokenSupply
  trendingScore
  trendingVolume
  trendingPaymentsCount
`;

const PARTICIPANT_FIELDS = `
  projectId
  chainId
  address
  volume
  volumeUsd
  balance
  creditBalance
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
  newlyIssuedTokenCount
  memo
`;

const ACTIVITY_EVENT_FIELDS = `
  id
  projectId
  chainId
  timestamp
  txHash
  from
  type
`;

export async function fetchProject(
  projectId: number,
  chainId: number,
  version: number = 5
): Promise<BendystrawProjectResponse['project']> {
  const client = getBendystrawClient(getNetworkFromChainId(chainId));

  const query = gql`
    query GetProject($projectId: Float!, $chainId: Float!, $version: Float!) {
      project(projectId: $projectId, chainId: $chainId, version: $version) {
        ${PROJECT_FIELDS}
      }
    }
  `;

  const data = await client.request<BendystrawProjectResponse>(query, {
    projectId,
    chainId,
    version,
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
      $where: projectFilter
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
      $where: participantFilter
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
    query GetPayEvents($where: payEventFilter, $limit: Int) {
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
    query GetActivityEvents($where: activityEventFilter, $limit: Int) {
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

export async function fetchParticipantsByAddress(
  params: BendystrawParticipantsByAddressParams
): Promise<BendystrawParticipantsByAddressResponse['participants']> {
  const client = getBendystrawClient(getNetworkFromChainId(params.chainId));

  const query = gql`
    query GetParticipantsByAddress(
      $where: participantFilter
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

  const data = await client.request<BendystrawParticipantsByAddressResponse>(query, {
    where: {
      address: params.address.toLowerCase(),
      chainId: params.chainId,
      balance_gt: '0',
    },
    orderBy: params.orderBy ?? 'balance',
    orderDirection: params.orderDirection ?? 'desc',
    limit: params.limit ?? 100,
  });

  return data.participants;
}

export async function fetchParticipant(
  params: BendystrawParticipantParams
): Promise<BendystrawParticipant | null> {
  const client = getBendystrawClient(getNetworkFromChainId(params.chainId));

  const query = gql`
    query GetParticipant($where: participantFilter) {
      participants(where: $where, limit: 1) {
        items {
          ${PARTICIPANT_FIELDS}
        }
      }
    }
  `;

  const data = await client.request<{ participants: { items: BendystrawParticipant[] } }>(query, {
    where: {
      projectId: params.projectId,
      chainId: params.chainId,
      address: params.address.toLowerCase(),
    },
  });

  return data.participants.items[0] ?? null;
}
