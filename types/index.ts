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
  name: string;
  tokenSymbol: string;
  storeCode: string;
  balance: number;
  isOwned: boolean;
}

export interface StoreDetails extends Store {
  valueAtStore: number;
  cashOutValue: number;
  borrowValue: number;
}

export type TokenType = 'USDC';

export interface Balance {
  token: TokenType;
  amount: number;
  usdValue: number;
}
