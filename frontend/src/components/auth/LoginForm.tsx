'use client';

import { Button } from '@/components/ui/Button';
import { DumbbellIcon } from '@/components/ui/DumbbellIcon';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { Spinner } from '@/components/ui/Spinner';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';

export const LoginForm = () => {
  const { status, error, startLogin } = useGoogleLogin();
  const isLoading = status === 'loading';

  return (
    <div className="bg-card border border-border rounded-[calc(var(--radius)+0.25rem)] p-10 w-full max-w-[22rem]">
      <div className="size-10 bg-foreground rounded-[0.625rem] flex items-center justify-center mx-auto mb-4">
        <DumbbellIcon className="size-5 text-background" />
      </div>

      <h1 className="text-center text-2xl font-semibold tracking-tight mb-1">Ficha de Treino</h1>
      <p className="text-center text-sm text-muted-foreground mb-8">
        Gerencie seus treinos de academia
      </p>

      <Button
        type="button"
        variant="outline"
        className="w-full gap-3 px-6 py-3 text-[0.9375rem] bg-card hover:border-ring/20"
        onClick={startLogin}
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner aria-label="Entrando" className="size-[18px]" />
            Entrando...
          </>
        ) : (
          <>
            <GoogleIcon />
            Entrar com Google
          </>
        )}
      </Button>

      {error && (
        <p role="alert" className="text-center text-xs text-destructive mt-4">
          {error}
        </p>
      )}

      <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
        Apenas autenticação via Google.
        <br />
        Seu cadastro é criado automaticamente.
      </p>
    </div>
  );
};
