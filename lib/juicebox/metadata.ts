import type { StoreCreationParams } from '@/types/juicebox';

const PINATA_JWT = process.env.EXPO_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export interface ProjectMetadata {
  name: string;
  description?: string;
  logoUri?: string;
  projectTagline?: string;
  tags?: string[];
}

export function buildProjectMetadata(params: StoreCreationParams): ProjectMetadata {
  return {
    name: params.name,
    description: params.description,
    logoUri: params.logoUri,
    projectTagline: `${params.ticker} rewards program`,
    tags: ['business'],
  };
}

export async function uploadMetadataToIPFS(metadata: ProjectMetadata): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error('PINATA_JWT environment variable is not set');
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.name}-metadata`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload metadata to IPFS: ${error}`);
  }

  const result = await response.json();
  return result.IpfsHash;
}

export function getIPFSUri(cid: string): string {
  return `ipfs://${cid}`;
}

export function getIPFSGatewayUrl(cid: string): string {
  return `${PINATA_GATEWAY}/${cid}`;
}

export async function fetchMetadataFromIPFS(cid: string): Promise<ProjectMetadata> {
  const url = getIPFSGatewayUrl(cid);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata from IPFS: ${response.statusText}`);
  }

  return response.json();
}

export function extractCidFromUri(uri: string): string | null {
  if (uri.startsWith('ipfs://')) {
    return uri.slice(7);
  }
  if (uri.includes('/ipfs/')) {
    const parts = uri.split('/ipfs/');
    return parts[1]?.split('/')[0] ?? null;
  }
  return null;
}
