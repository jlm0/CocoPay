export const APP_SCHEME = 'cocopay://';

export const USDC_SEPOLIA_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const;

export const TOKEN_DECIMALS = {
  ETH: 18,
  USDC: 6,
} as const;

export const COINGECKO_IDS = {
  ETH: 'ethereum',
  USDC: 'usd-coin',
} as const;

export const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export const ETH_GAS_BUFFER = 0.001;

export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const USDC_APPROVAL_AMOUNT = 5000n * 10n ** 6n;
