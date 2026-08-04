import { act, renderHook } from '@testing-library/react';
import { buildAuthUrl, useGoogleLogin } from './useGoogleLogin';

const STATE_KEY = 'ficha_treino_google_state';
const CLIENT_ID = 'test-client-id';

afterEach(() => {
  delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  sessionStorage.clear();
});

describe('buildAuthUrl', () => {
  /**
   * Builds the Google OAuth URL with all required params.
   * Mock: CLIENT_ID constant, redirect URI, state-abc.
   * Assert: URL contains client_id, redirect_uri, response_type=code, scope, prompt, state.
   */
  test('builds the Google OAuth URL with all required params', () => {
    const url = buildAuthUrl(CLIENT_ID, 'http://localhost:3000/auth/google/callback', 'state-abc');
    const parsed = new URL(url);

    expect(`${parsed.origin}${parsed.pathname}`).toBe(
      'https://accounts.google.com/o/oauth2/v2/auth',
    );
    expect(parsed.searchParams.get('client_id')).toBe(CLIENT_ID);
    expect(parsed.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/auth/google/callback',
    );
    expect(parsed.searchParams.get('response_type')).toBe('code');
    expect(parsed.searchParams.get('scope')).toBe('openid email profile');
    expect(parsed.searchParams.get('prompt')).toBe('select_account');
    expect(parsed.searchParams.get('state')).toBe('state-abc');
  });
});

describe('useGoogleLogin', () => {
  /**
   * Returns error when the Google client id is not configured.
   * Mock: NEXT_PUBLIC_GOOGLE_CLIENT_ID deleted.
   * Assert: status is 'error', error message in PT-BR, no state in sessionStorage.
   */
  test('returns error when the Google client id is not configured', () => {
    const { result } = renderHook(() => useGoogleLogin());

    act(() => {
      result.current.startLogin();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Login com Google indisponível no momento.');
    expect(sessionStorage.getItem(STATE_KEY)).toBeNull();
  });

  /**
   * Stores the OAuth state and redirects to Google.
   * Mock: NEXT_PUBLIC_GOOGLE_CLIENT_ID set, navigate mock.
   * Assert: navigate called with Google URL, sessionStorage contains state.
   */
  test('stores the OAuth state and redirects to Google', () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = CLIENT_ID;
    const navigate = jest.fn<(url: string) => void, [url: string]>();
    const { result } = renderHook(() => useGoogleLogin(navigate));

    act(() => {
      result.current.startLogin();
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.error).toBeNull();

    expect(navigate).toHaveBeenCalledTimes(1);
    const url = new URL(navigate.mock.calls[0][0]);
    expect(`${url.origin}${url.pathname}`).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('client_id')).toBe(CLIENT_ID);
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/auth/google/callback');
    expect(sessionStorage.getItem(STATE_KEY)).toBe(url.searchParams.get('state'));
  });
});
