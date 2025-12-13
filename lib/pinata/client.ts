import type { PinataConfig } from './types';

const PINATA_JWT = process.env.EXPO_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = process.env.EXPO_PUBLIC_PINATA_GATEWAY ?? 'gateway.pinata.cloud';
const PINATA_UPLOAD_URL = 'https://uploads.pinata.cloud/v3/files';

let cachedConfig: PinataConfig | null = null;

export function getPinataConfig(): PinataConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (!PINATA_JWT) {
    throw new Error('EXPO_PUBLIC_PINATA_JWT environment variable is not set');
  }

  cachedConfig = {
    jwt: PINATA_JWT,
    gateway: PINATA_GATEWAY,
    uploadUrl: PINATA_UPLOAD_URL,
  };

  return cachedConfig;
}

export function resetPinataConfig(): void {
  cachedConfig = null;
}
