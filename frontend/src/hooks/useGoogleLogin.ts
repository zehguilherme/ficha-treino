import { useCallback, useEffect, useState } from 'react';

export type LoginStatus = 'idle' | 'loading' | 'error';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_SCOPE = 'openid email profile';
const STATE_KEY = 'ficha_treino_google_state';

export const buildAuthUrl = (clientId: string, redirectUri: string, state: string): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPE,
    prompt: 'select_account',
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

const navigateTo = (url: string): void => {
  window.location.href = url;
};

export const useGoogleLogin = (navigate: (url: string) => void = navigateTo) => {
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resetOnRestore = (event: PageTransitionEvent): void => {
      if (!event.persisted) return;
      setStatus('idle');
      setError(null);
    };

    window.addEventListener('pageshow', resetOnRestore);
    return () => window.removeEventListener('pageshow', resetOnRestore);
  }, []);

  const startLogin = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setStatus('error');
      setError('Login com Google indisponível no momento.');
      return;
    }

    const state = crypto.randomUUID();
    sessionStorage.setItem(STATE_KEY, state);

    setStatus('loading');
    setError(null);
    navigate(buildAuthUrl(clientId, `${window.location.origin}/auth/google/callback`, state));
  }, [navigate]);

  return { status, error, startLogin };
};
