import { IS_MAINNET } from '@/lib/network';

export interface RetryConfig {
  maxDurationMs: number;
  initialIntervalMs: number;
  maxIntervalMs: number;
  backoffMultiplier: number;
}

export const MAINNET_RETRY_CONFIG: RetryConfig = {
  maxDurationMs: 60_000,
  initialIntervalMs: 2_000,
  maxIntervalMs: 8_000,
  backoffMultiplier: 1.5,
};

export const TESTNET_RETRY_CONFIG: RetryConfig = {
  maxDurationMs: 300_000,
  initialIntervalMs: 3_000,
  maxIntervalMs: 15_000,
  backoffMultiplier: 1.5,
};

export function getRetryConfig(): RetryConfig {
  return IS_MAINNET ? MAINNET_RETRY_CONFIG : TESTNET_RETRY_CONFIG;
}
