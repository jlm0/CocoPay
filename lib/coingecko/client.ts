import { COINGECKO_API_URL, COINGECKO_IDS } from '@/lib/constants';

export type TokenPrices = {
  eth: number;
  usdc: number;
};

type CoinGeckoResponse = {
  [key: string]: {
    usd: number;
  };
};

export async function fetchTokenPrices(): Promise<TokenPrices> {
  const ids = `${COINGECKO_IDS.ETH},${COINGECKO_IDS.USDC}`;
  const url = `${COINGECKO_API_URL}/simple/price?ids=${ids}&vs_currencies=usd`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data: CoinGeckoResponse = await response.json();

  return {
    eth: data[COINGECKO_IDS.ETH]?.usd ?? 0,
    usdc: data[COINGECKO_IDS.USDC]?.usd ?? 1,
  };
}
