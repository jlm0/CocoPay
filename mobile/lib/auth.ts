import { openAuthSessionAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { APP_SCHEME } from './constants';
import { HEX_COLORS } from './theme';

export async function openAuthUrl(url: string): Promise<{ success: boolean }> {
  const authUrl = new URL(url);
  authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME);

  const result = await openAuthSessionAsync(authUrl.toString(), APP_SCHEME, {
    preferEphemeralSession: false,
    presentationStyle: WebBrowserPresentationStyle.FULL_SCREEN,
    controlsColor: HEX_COLORS.primary,
    dismissButtonStyle: 'done',
    toolbarColor: HEX_COLORS.background,
    enableBarCollapsing: true,
  });

  return {
    success: result.type === 'success',
  };
}
