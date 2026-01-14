export * from './revnet';

export type AuthStatus = 'idle' | 'loading' | 'verifying' | 'completing' | 'success' | 'error';

export interface User {
  id: string;
  email?: string;
}

export interface Wallet {
  id: string;
  address: string;
  type: string;
}

export interface OAuthLoginResult {
  success: boolean;
  error?: string;
}

export interface Store {
  id: string;
  suckerGroupId: string;
  name: string;
  tokenSymbol: string;
  storeCode: string;
  balance: number;
  isOwned: boolean;
  logoUri?: string;
}

export interface StoreAddress {
  formatted: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface StoreDetails extends Store {
  valueAtStore: number;
  cashOutValue: number;
  borrowValue: number;
  description?: string;
  logoUri?: string;
  address?: StoreAddress;
  website?: string;
  cashBackPercent: number;
  issuanceCutPercent: number;
}

export type SortOption = 'name' | 'cashback';
export type ViewMode = 'list' | 'map';

export interface DiscoverStore {
  id: string;
  projectId: number;
  chainId: number;
  name: string;
  tokenSymbol: string;
  description?: string;
  logoUri?: string;
  address?: StoreAddress;
  cashBackPercent: number;
  issuanceCutPercent: number;
}

export type TokenType = 'USDC';

export interface Balance {
  token: TokenType;
  amount: number;
  usdValue: number;
}
