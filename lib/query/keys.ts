export const queryKeys = {
  balance: {
    all: ['balance'] as const,
    eth: (address: string | null | undefined, chainId: number) =>
      ['balance', 'eth', address, chainId] as const,
    usdc: (address: string | null | undefined, chainId: number) =>
      ['balance', 'usdc', address, chainId] as const,
  },

  coingecko: {
    all: ['coingecko'] as const,
    prices: () => ['coingecko', 'prices'] as const,
  },

  bendystraw: {
    all: ['bendystraw'] as const,
    project: (projectId: number | null, chainId: number) =>
      ['bendystraw', 'project', projectId, chainId] as const,
    projects: (
      owner: string | null | undefined,
      chainId: number | null | undefined,
      orderBy: string | undefined,
      limit: number | undefined
    ) => ['bendystraw', 'projects', owner, chainId, orderBy, limit] as const,
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
    project: (projectId: string | undefined) => ['jb-project', projectId] as const,
    loan: (loanId: string | undefined) => ['jb-loan', loanId] as const,
    payQuote: (projectId: string | undefined, amount: string | undefined) =>
      ['jb-pay-quote', projectId, amount] as const,
    cashOutQuote: (projectId: string | undefined, tokenAmount: string | undefined) =>
      ['jb-cashout-quote', projectId, tokenAmount] as const,
    loanQuote: (projectId: string | undefined, collateralAmount: string | undefined) =>
      ['jb-loan-quote', projectId, collateralAmount] as const,
  },

  transfers: (address: string | null | undefined, chainId: number) =>
    ['transfers', address, chainId] as const,

  resolveAddress: (input: string) => ['resolveAddress', input] as const,

  usdcAllowance: (address: string | null | undefined, spender: string | null | undefined) =>
    ['usdc-allowance', address, spender] as const,

  pinata: {
    fetch: (cid: string) => ['pinata', 'fetch', cid] as const,
  },
} as const;
