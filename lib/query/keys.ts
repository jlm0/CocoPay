export const queryKeys = {
  balance: {
    all: ['balance'] as const,
    usdc: (address: string | null | undefined, chainId: number) =>
      ['balance', 'usdc', address, chainId] as const,
    multiChainUsdc: (address: string | null | undefined) =>
      ['balance', 'multi-chain-usdc', address] as const,
    unified: (address: string | null | undefined) => ['balance', 'unified', address] as const,
  },

  multiChain: {
    all: ['multi-chain'] as const,
    participations: (address: string | null | undefined) =>
      ['multi-chain', 'participations', address] as const,
    reclaimable: (address: string | null | undefined) =>
      ['multi-chain', 'reclaimable', address] as const,
    reclaimableByProject: (
      projectId: number | undefined,
      chainId: number | undefined,
      tokenAmount: string | undefined
    ) => ['multi-chain', 'reclaimable', projectId, chainId, tokenAmount] as const,
  },

  bendystraw: {
    all: ['bendystraw'] as const,
    project: (projectId: number | null, chainId: number) =>
      ['bendystraw', 'project', projectId, chainId] as const,
    projects: (params: {
      where?: Record<string, unknown>;
      orderBy?: string;
      orderDirection?: string;
      limit?: number;
    }) => ['bendystraw', 'projects', params] as const,
    participant: (projectId: number, chainId: number, address: string | null) =>
      ['bendystraw', 'participant', projectId, chainId, address] as const,
    participants: (
      projectId: number | undefined,
      chainId: number | undefined,
      orderBy: string | undefined,
      limit: number | undefined
    ) => ['bendystraw', 'participants', projectId, chainId, orderBy, limit] as const,
    participations: (address: string | null, chainId: number) =>
      ['bendystraw', 'participations', address, chainId] as const,
    activity: (
      projectId: number | undefined,
      chainId: number | undefined,
      type: string | undefined,
      limit: number | undefined
    ) => ['bendystraw', 'activity', projectId, chainId, type, limit] as const,
    payEvents: (
      projectId: number | undefined,
      chainId: number | undefined,
      limit: number | undefined
    ) => ['bendystraw', 'payEvents', projectId, chainId, limit] as const,
  },

  projectMetadata: {
    all: ['project-metadata'] as const,
    byCid: (cid: string | null) => ['project-metadata', cid] as const,
  },

  cocopayRegistry: {
    all: ['cocopay-registry'] as const,
    local: () => ['cocopay-registry', 'local'] as const,
    sync: () => ['cocopay-registry', 'sync'] as const,
  },

  jb: {
    project: (projectId: string | undefined, chainId?: string) =>
      ['jb-project', projectId, chainId] as const,
    loan: (loanId: string | undefined, chainId?: string) => ['jb-loan', loanId, chainId] as const,
    payQuote: (projectId: string | undefined, amount: string | undefined, chainId?: string) =>
      ['jb-pay-quote', projectId, amount, chainId] as const,
    cashOutQuote: (
      projectId: string | undefined,
      tokenAmount: string | undefined,
      chainId?: string
    ) => ['jb-cashout-quote', projectId, tokenAmount, chainId] as const,
    loanQuote: (
      projectId: string | undefined,
      collateralAmount: string | undefined,
      chainId?: string
    ) => ['jb-loan-quote', projectId, collateralAmount, chainId] as const,
  },

  transfers: (address: string | null | undefined, chainId: number) =>
    ['transfers', address, chainId] as const,

  discover: {
    all: ['discover'] as const,
    stores: (chainId: number) => ['discover', 'stores', chainId] as const,
  },

  resolveAddress: (input: string) => ['resolveAddress', input] as const,

  usdcAllowance: (address: string | null | undefined, spender: string | null | undefined) =>
    ['usdc-allowance', address, spender] as const,

  pinata: {
    fetch: (cid: string) => ['pinata', 'fetch', cid] as const,
  },
} as const;
