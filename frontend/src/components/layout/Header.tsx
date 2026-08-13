'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { DumbbellIcon } from '@/components/ui/DumbbellIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/dashboard';

export const Header = (): React.JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();
  const { isProfilePending, logout, status, user } = useAuth();
  const authenticated = status === 'authenticated';
  const handleLogout = (): void => {
    logout();
    router.replace('/login');
  };
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-[80rem] items-center gap-3 px-6">
        <Link
          href={authenticated ? '/dashboard' : '/'}
          className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground">
            <DumbbellIcon />
          </span>
          <span className="text-base font-semibold tracking-tight">Ficha de Treino</span>
        </Link>
        <div className="ml-auto">
          {status === 'loading' || isProfilePending ? (
            <span
              className="block size-8 rounded-full border border-border bg-muted"
              aria-hidden="true"
            />
          ) : authenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="Abrir menu do usuário"
                >
                  {getInitials(user?.name ?? '')}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/account">Minha conta</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={handleLogout}
                >
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : pathname !== '/login' ? (
            <Button variant="outline" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
