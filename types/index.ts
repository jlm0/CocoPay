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
