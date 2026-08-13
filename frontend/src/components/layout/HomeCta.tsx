'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/ArrowRightIcon';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export const HomeCta = (): React.JSX.Element => {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <Button
        disabled
        className="bg-background text-foreground font-semibold rounded-[calc(var(--radius)+0.125rem)] px-8 py-3.5 text-[0.9375rem]"
      >
        Carregando…
      </Button>
    );
  }

  const authenticated = status === 'authenticated';

  return (
    <Button
      asChild
      className="group bg-background text-foreground font-semibold rounded-[calc(var(--radius)+0.125rem)] px-8 py-3.5 hover:bg-background/90 hover:-translate-y-px hover:shadow-[0_4px_20px_hsl(222.2,84%,4.9%/0.2)] text-[0.9375rem]"
    >
      <Link href={authenticated ? '/dashboard' : '/login'}>
        {authenticated ? 'Ir para meus treinos' : 'Começar agora'}
        <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]" />
      </Link>
    </Button>
  );
};
