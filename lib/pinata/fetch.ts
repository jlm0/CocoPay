import type { GetCIDResponse } from 'pinata';
import { getPinataClient } from './client';

const PINATA_GATEWAY = process.env.EXPO_PUBLIC_PINATA_GATEWAY ?? 'gateway.pinata.cloud';

export async function fetchByCid(cid: string): Promise<GetCIDResponse> {
  const client = getPinataClient();
  return client.gateways.public.get(cid);
}

export async function convertToGatewayUrl(cid: string): Promise<string> {
  const client = getPinataClient();
  return client.gateways.public.convert(cid);
}

export function getGatewayUrl(cid: string): string {
  return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
}

export function getIpfsUri(cid: string): string {
  return `ipfs://${cid}`;
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
