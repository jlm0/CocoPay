import { parseStoreCode } from '@/lib/juicebox/transforms';

export interface PayLinkParams {
  store: string;
  amount?: string;
}

const UNIVERSAL_LINK_HOST = 'https://cocopay.app';
const APP_SCHEME = 'cocopay://';

export function parsePayLink(url: string): PayLinkParams | null {
  try {
    const parsed = new URL(url);

    const store = parsed.searchParams.get('store');
    const amount = parsed.searchParams.get('amount');

    if (!store) return null;

    const parsedStore = parseStoreCode(store);
    if (!parsedStore) return null;

    if (amount) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) return null;
      if (!/^\d+(\.\d{1,2})?$/.test(amount)) return null;
    }

    return {
      store,
      amount: amount ?? undefined,
    };
  } catch {
    return null;
  }
}

export function buildPayLink(store: string, amount?: string): string {
  const url = new URL(`${UNIVERSAL_LINK_HOST}/pay`);
  url.searchParams.set('store', store);
  if (amount) {
    url.searchParams.set('amount', amount);
  }
  return url.toString();
}

export function buildAppPayLink(store: string, amount?: string): string {
  const params = new URLSearchParams();
  params.set('store', store);
  if (amount) {
    params.set('amount', amount);
  }
  return `${APP_SCHEME}pay?${params.toString()}`;
}

export function isPayLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    const isUniversalLink = parsed.host === 'cocopay.app' && parsed.pathname.startsWith('/pay');
    const isAppScheme = parsed.protocol === 'cocopay:' && parsed.pathname.startsWith('/pay');
    return (isUniversalLink || isAppScheme) && parsed.searchParams.has('store');
  } catch {
    return false;
  }
}
