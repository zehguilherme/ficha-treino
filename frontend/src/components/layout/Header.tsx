'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { DumbbellIcon } from '@/components/ui/DumbbellIcon';
import { UserMenu } from '@/components/layout/UserMenu';
import { useAuth } from '@/contexts/AuthContext';

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
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[0.625rem] bg-foreground">
            <DumbbellIcon className="size-5 text-background" />
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
            <UserMenu name={user?.name ?? ''} showAccountLink onLogout={handleLogout} />
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
