import { useEffect, useState, useRef } from 'react';
import * as Linking from 'expo-linking';
import { parsePayLink } from '@/lib/url/pay-link';

export type DeepLinkStatus = 'pending' | 'deeplink' | 'none';

export interface DeepLinkResult {
  status: DeepLinkStatus;
  params: { store?: string; amount?: string } | null;
  error: string | null;
}

function isExternalPayLink(url: string): boolean {
  return url.startsWith('cocopay://') || url.includes('cocopay.app/pay');
}

export function useDeepLinkSource(): DeepLinkResult {
  const [status, setStatus] = useState<DeepLinkStatus>('pending');
  const [params, setParams] = useState<{ store?: string; amount?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (initialUrl && isExternalPayLink(initialUrl)) {
          const parsed = parsePayLink(initialUrl);

          if (parsed) {
            setParams(parsed);
            setStatus('deeplink');
          } else {
            setError('Invalid payment link format');
            setStatus('none');
          }
        } else {
          setStatus('none');
        }
      } catch {
        setError('Failed to process link');
        setStatus('none');
      }
    };

    checkInitialURL();
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      if (isExternalPayLink(event.url)) {
        const parsed = parsePayLink(event.url);
        if (parsed) {
          setParams(parsed);
          setStatus('deeplink');
          setError(null);
        } else {
          setError('Invalid payment link');
          setStatus('none');
          setParams(null);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  return { status, params, error };
}
