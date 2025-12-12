import type { StoreCreationParams } from '@/types/juicebox';
import {
  uploadJson,
  fetchByCid,
  getIpfsUri,
  getGatewayUrl,
  extractCidFromUri as extractCid,
} from '@/lib/pinata';

export interface CocoPayMetadata {
  version: number;
  ticker: string;
  cashBackPercent: number;
  loyaltyBonusPercent: number;
  createdAt: string;
}

export interface ProjectMetadata {
  name: string;
  description?: string;
  logoUri?: string;
  projectTagline?: string;
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
    tags: ['business'],
    cocopay: {
      version: COCOPAY_METADATA_VERSION,
      ticker: params.ticker,
      cashBackPercent: params.cashBackPercent,
      loyaltyBonusPercent: params.loyaltyBonusPercent,
      createdAt: new Date().toISOString(),
    },
  };
}

export async function uploadMetadataToIPFS(metadata: ProjectMetadata): Promise<string> {
  const response = await uploadJson(metadata, {
    name: `${metadata.name}-metadata`,
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
