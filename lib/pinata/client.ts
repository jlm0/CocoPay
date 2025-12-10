import { PinataSDK } from 'pinata';

const PINATA_JWT = process.env.EXPO_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = process.env.EXPO_PUBLIC_PINATA_GATEWAY ?? 'gateway.pinata.cloud';

function createPinataClient(): PinataSDK {
  if (!PINATA_JWT) {
    throw new Error('EXPO_PUBLIC_PINATA_JWT environment variable is not set');
  }

  return new PinataSDK({
    pinataJwt: PINATA_JWT,
    pinataGateway: PINATA_GATEWAY,
  });
}

let pinataClient: PinataSDK | null = null;

export function getPinataClient(): PinataSDK {
  if (!pinataClient) {
    pinataClient = createPinataClient();
  }
  return pinataClient;
}

export function resetPinataClient(): void {
  pinataClient = null;
}
