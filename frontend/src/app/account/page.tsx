'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AccountDeleteDialog } from '@/components/account/AccountDeleteDialog';
import { ErrorAlertDialog } from '@/components/ui/ErrorAlertDialog';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Loading } from '@/components/ui/Loading';
import { IconLink } from '@/components/ui/IconLink';
import { ArrowLeftIcon, TrashIcon } from '@/components/ui/WorkoutIcons';
import { useAuth } from '@/contexts/AuthContext';
import { deleteAccount } from '@/lib/api';
import { getInitials } from '@/lib/dashboard';
import { useRouter } from 'next/navigation';

const AccountPage = (): React.JSX.Element => {
  const router = useRouter();
  const { isProfileError, isProfilePending, logout, refetchProfile, status, user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [isRetryingProfile, setIsRetryingProfile] = useState(false);
  const [profileErrorDismissed, setProfileErrorDismissed] = useState(false);
  const deletion = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      logout();
      setDialogOpen(false);
      router.replace('/login');
    },
    onError: () => setErrorOpen(true),
  });

  useEffect(() => {
    if (status === 'anonymous') router.replace('/login');
  }, [router, status]);
  const retryProfile = (): void => {
    setProfileErrorDismissed(false);
    setIsRetryingProfile(true);
    void refetchProfile().finally(() => setIsRetryingProfile(false));
  };
  const profileErrorDialog = (
    <ErrorAlertDialog
      open={isProfileError && !profileErrorDismissed && !isRetryingProfile}
      onOpenChange={(open) => {
        if (!open) setProfileErrorDismissed(true);
      }}
      message="Não foi possível carregar os dados da sua conta."
    />
  );
  if (status !== 'authenticated' || (isProfilePending && !isRetryingProfile))
    return (
      <>
        {profileErrorDialog}
        <main className="flex flex-1 items-center justify-center bg-background">
          <Loading message="Carregando sua conta..." />
        </main>
      </>
    );
  if (isProfileError || isRetryingProfile || !user)
    return (
      <>
        {profileErrorDialog}
        <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-background px-4">
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar os dados da sua conta.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={retryProfile}
            loading={isRetryingProfile}
          >
            {isRetryingProfile ? 'Tentando novamente…' : 'Tentar novamente'}
          </Button>
        </main>
      </>
    );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-[80rem] items-center gap-3 px-6">
          <IconLink
            href="/dashboard"
            icon={<ArrowLeftIcon className="size-4" aria-hidden="true" />}
            variant="outline"
            size="icon"
            aria-label="Voltar"
            className="rounded-md bg-card"
          />
          <span className="text-base font-semibold">Minha Conta</span>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-muted text-xs font-semibold"
                  aria-label="Abrir menu do usuário"
                >
                  {getInitials(user.name)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => {
                    logout();
                    router.replace('/login');
                  }}
                >
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight">Minha Conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie suas informações e preferências
          </p>
          <section className="mt-8 overflow-hidden rounded-[calc(var(--radius)+0.125rem)] border border-border bg-card">
            <div className="border-b border-border p-5">
              <h2 className="text-[0.9375rem] font-medium">Perfil</h2>
            </div>
            <div>
              <div className="flex items-center gap-3 border-b border-border p-5">
                <div
                  role="img"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
                  aria-label={`Avatar de ${user.name}`}
                >
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Nome</p>
                  <p className="text-sm">{user.name}</p>
                </div>
              </div>
              <div className="border-b border-border p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">E-mail</p>
                <p className="break-words text-sm">{user.email}</p>
              </div>
            </div>
          </section>
          <section className="mt-4 overflow-hidden rounded-[calc(var(--radius)+0.125rem)] border border-destructive/20 bg-card">
            <div className="border-b border-destructive/20 p-5">
              <h2 className="text-[0.9375rem] font-medium text-destructive">Zona de perigo</h2>
            </div>
            <div className="p-5">
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                Ao excluir sua conta, todos os seus dados serão permanentemente removidos, incluindo
                seus treinos, histórico e progresso. Esta ação é irreversível.
              </p>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
                  disabled={deletion.isPending}
                >
                  <TrashIcon className="size-4" aria-hidden="true" />
                  Excluir minha conta
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <AccountDeleteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isPending={deletion.isPending}
        onConfirm={() => deletion.mutate()}
      />
      <ErrorAlertDialog
        open={errorOpen}
        onOpenChange={setErrorOpen}
        message="Não foi possível excluir sua conta. Tente novamente."
      />
    </>
  );
};

export default AccountPage;
