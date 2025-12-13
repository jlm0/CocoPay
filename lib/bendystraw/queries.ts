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
  const start = Date.now();
  console.log(`[fetchProject] START projectId=${projectId} chainId=${chainId} version=${version}`);

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

  console.log(
    `[fetchProject] END ${Date.now() - start}ms projectId=${projectId} result=${data.project ? 'found' : 'null'}`
  );

  return data.project;
}

export async function fetchProjects(
  params: BendystrawProjectsQueryParams = {}
): Promise<BendystrawProjectsResponse['projects']> {
  const start = Date.now();
  const chainId = params.where?.chainId ?? 11155111;
  const owner = params.where?.owner ?? 'none';
  console.log(`[fetchProjects] START chainId=${chainId} owner=${owner}`);

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

  console.log(
    `[fetchProjects] END ${Date.now() - start}ms count=${data.projects.items.length} total=${data.projects.totalCount}`
  );

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
