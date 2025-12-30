import type { StoreCreationParams, StoreAddress } from '@/types/juicebox';
import {
  uploadJsonWithRetry,
  fetchByCid,
  getIpfsUri,
  getGatewayUrl,
  extractCidFromUri as extractCid,
} from '@/lib/pinata';
import { sanitizeForIPFS } from '@/lib/utils/sanitize';
import { COCOPAY_ISSUANCE_CUT_PERCENT } from './constants';

export interface CocoPayMetadata {
  version: number;
  ticker: string;
  cashBackPercent: number;
  issuanceCutPercent: number;
  address?: StoreAddress;
  createdAt: string;
}

export interface ProjectMetadata {
  name: string;
  description?: string;
  logoUri?: string;
  projectTagline?: string;
  infoUri?: string;
  tags?: string[];
  domain?: string;
  version?: number;
  cocopay?: CocoPayMetadata;
}

export const COCOPAY_METADATA_DOMAIN = 'cocopay';
export const COCOPAY_METADATA_SCHEMA_VERSION = 1;

export const COCOPAY_METADATA_VERSION = 1;

export function buildProjectMetadata(params: StoreCreationParams): ProjectMetadata {
  return {
    name: params.name,
    description: params.description,
    logoUri: params.logoUri,
    projectTagline: `${params.ticker} rewards program`,
    infoUri: params.website,
    tags: ['business'],
    domain: COCOPAY_METADATA_DOMAIN,
    version: COCOPAY_METADATA_SCHEMA_VERSION,
    cocopay: {
      version: COCOPAY_METADATA_VERSION,
      ticker: params.ticker,
      cashBackPercent: params.cashBackPercent,
      issuanceCutPercent: COCOPAY_ISSUANCE_CUT_PERCENT,
      address: params.address,
      createdAt: new Date().toISOString(),
    },
  };
}

export async function uploadMetadataToIPFS(metadata: ProjectMetadata): Promise<string> {
  const sanitized = sanitizeForIPFS(metadata);
  const response = await uploadJsonWithRetry(sanitized, {
    name: `${sanitized.name}-metadata`,
    keyvalues: {
      app: 'cocopay',
      type: 'project-metadata',
    },
  });

  return response.cid;
}

export function getIPFSUri(cid: string): string {
  return getIpfsUri(cid);
}

export function getIPFSGatewayUrl(cid: string): string {
  return getGatewayUrl(cid);
}

export async function fetchMetadataFromIPFS(cid: string): Promise<ProjectMetadata> {
  const response = await fetchByCid(cid);
  return response.data as unknown as ProjectMetadata;
}

export function extractCidFromUri(uri: string): string | null {
  return extractCid(uri);
}
