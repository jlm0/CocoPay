import { openAuthSessionAsync } from 'expo-web-browser';
import { APP_SCHEME } from './constants';

export async function openAuthUrl(url: string): Promise<{ success: boolean }> {
  const authUrl = new URL(url);
  authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME);

  const result = await openAuthSessionAsync(authUrl.toString(), APP_SCHEME);

  return {
    success: result.type === 'success',
  };
}
