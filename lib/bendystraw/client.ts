import { GraphQLClient } from 'graphql-request';

const TESTNET_URL =
  process.env.EXPO_PUBLIC_BENDYSTRAW_TESTNET_URL ??
  'https://testnet.bendystraw.xyz/3ZnUeT81B3UVf4RPLDQLebMW';
const MAINNET_URL =
  process.env.EXPO_PUBLIC_BENDYSTRAW_URL ?? 'https://bendystraw.xyz/3ZnUeT81B3UVf4RPLDQLebMW';

export type BendystrawNetwork = 'mainnet' | 'testnet';

const clients: Record<BendystrawNetwork, GraphQLClient | null> = {
  mainnet: null,
  testnet: null,
};

export function getBendystrawClient(network: BendystrawNetwork = 'testnet'): GraphQLClient {
  if (!clients[network]) {
    const endpoint = network === 'testnet' ? `${TESTNET_URL}/graphql` : `${MAINNET_URL}/graphql`;

    clients[network] = new GraphQLClient(endpoint);
  }

  return clients[network]!;
}

export function getNetworkFromChainId(chainId: number): BendystrawNetwork {
  const mainnetChainIds = [1, 42161, 8453, 10];
  return mainnetChainIds.includes(chainId) ? 'mainnet' : 'testnet';
}

export function resetBendystrawClients(): void {
  clients.mainnet = null;
  clients.testnet = null;
}
