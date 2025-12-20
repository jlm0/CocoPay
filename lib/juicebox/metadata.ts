import type { StoreCreationParams, StoreAddress } from '@/types/juicebox';
import {
  uploadJsonWithRetry,
  fetchByCid,
  getIpfsUri,
  getGatewayUrl,
  extractCidFromUri as extractCid,
} from '@/lib/pinata';
import { sanitizeForIPFS } from '@/lib/utils/sanitize';

export interface CocoPayMetadata {
  version: number;
  ticker: string;
  cashBackPercent: number;
  loyaltyBonusPercent: number;
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
  cocopay?: CocoPayMetadata;
}

export const COCOPAY_METADATA_VERSION = 1;

export function buildProjectMetadata(params: StoreCreationParams): ProjectMetadata {
  return {
    name: params.name,
    description: params.description,
    logoUri: params.logoUri,
    projectTagline: `${params.ticker} rewards program`,
    infoUri: params.website,
    tags: ['business'],
    cocopay: {
      version: COCOPAY_METADATA_VERSION,
      ticker: params.ticker,
      cashBackPercent: params.cashBackPercent,
      loyaltyBonusPercent: params.loyaltyBonusPercent,
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
