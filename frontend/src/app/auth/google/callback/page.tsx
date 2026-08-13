'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { exchangeGoogleCode } from '@/lib/api';

const STATE_KEY = 'ficha_treino_google_state';

const GoogleCallbackPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    const failWith = (message: string): void => {
      sessionStorage.removeItem(STATE_KEY);
      setError(message);
    };

    if (params.get('error') === 'access_denied') {
      router.replace('/login');
      return;
    }
    if (!code || !state || state !== sessionStorage.getItem(STATE_KEY)) {
      failWith('Falha na autenticação com o Google. Tente novamente.');
      return;
    }
    sessionStorage.removeItem(STATE_KEY);

    const exchange = async (): Promise<void> => {
      try {
        const { token } = await exchangeGoogleCode(code);
        login(token);
        router.replace('/dashboard');
      } catch (error) {
        const authFailed = axios.isAxiosError(error) && error.response !== undefined;
        failWith(
          authFailed
            ? 'Não foi possível autenticar com o Google. Tente novamente.'
            : 'Não foi possível conectar ao servidor. Tente novamente.',
        );
      }
    };
    void exchange();
  }, [login, router]);

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8 bg-background">
      <div className="bg-card border border-border rounded-[calc(var(--radius)+0.25rem)] p-10 w-full max-w-[22rem] text-center">
        {error ? (
          <>
            <p role="alert" className="text-sm text-destructive mb-6">
              {error}
            </p>
            <Button variant="outline" className="w-full" onClick={() => router.replace('/login')}>
              Voltar para o login
            </Button>
          </>
        ) : (
          <>
            <Spinner aria-label="Autenticando" className="mx-auto size-6" />
            <p className="text-sm text-muted-foreground mt-4">Autenticando...</p>
          </>
        )}
      </div>
    </main>
  );
};

export default GoogleCallbackPage;
