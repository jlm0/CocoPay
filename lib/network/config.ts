export type NetworkEnvironment = 'testnet' | 'mainnet';

const ENV = process.env.EXPO_PUBLIC_NETWORK_ENV;

function validateNetworkEnv(env: string | undefined): NetworkEnvironment {
  if (env === 'mainnet') return 'mainnet';
  return 'testnet';
}

export const NETWORK_ENV = validateNetworkEnv(ENV);
export const IS_MAINNET = NETWORK_ENV === 'mainnet';
export const IS_TESTNET = NETWORK_ENV === 'testnet';
