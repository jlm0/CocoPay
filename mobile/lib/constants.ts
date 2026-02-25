import { OMNICHAIN_CHAIN_IDS, type OmnichainChainId } from './juicebox/constants';
import { getUsdcAddress } from './juicebox/chain-selection';
import { CHAIN_NAMES } from '@/lib/network';

export const APP_SCHEME = 'cocopay://';

export const SUPPORTED_CHAIN_IDS = OMNICHAIN_CHAIN_IDS;
export type SupportedChainId = OmnichainChainId;

export { CHAIN_NAMES, getUsdcAddress };

export const USDC_SEPOLIA_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const;

export const TOKEN_DECIMALS = {
  USDC: 6,
} as const;

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
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const USDC_APPROVAL_AMOUNT = 5000n * 10n ** 6n;
