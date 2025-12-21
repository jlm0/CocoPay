import { getPinataConfig } from './client';
import type { FetchResponse } from './types';

export async function fetchByCid<T = unknown>(cid: string): Promise<FetchResponse<T>> {
  const config = getPinataConfig();
  const url = `https://${config.gateway}/ipfs/${cid}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Pinata fetch failed (${response.status}): ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') ?? '';

  let data: T;
  if (contentType.includes('application/json')) {
    data = (await response.json()) as T;
  } else {
    data = (await response.text()) as unknown as T;
  }

  return { data, contentType };
}

export async function convertToGatewayUrl(cid: string): Promise<string> {
  const config = getPinataConfig();
  return `https://${config.gateway}/ipfs/${cid}`;
}

export function getGatewayUrl(cid: string): string {
  const config = getPinataConfig();
  return `https://${config.gateway}/ipfs/${cid}`;
}

export function getIpfsUri(cid: string): string {
  return `ipfs://${cid}`;
}

export function extractCidFromUri(uri: string): string | null {
  if (!uri) {
    return null;
  }
  if (uri.startsWith('ipfs://')) {
    return uri.slice(7);
  }
  if (uri.includes('/ipfs/')) {
    const parts = uri.split('/ipfs/');
    return parts[1]?.split('/')[0] ?? null;
  }
  if (uri.startsWith('Qm') || uri.startsWith('bafk') || uri.startsWith('bafy')) {
    return uri;
  }
  return null;
}
