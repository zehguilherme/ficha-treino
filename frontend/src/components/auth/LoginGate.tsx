'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';

interface LoginGateProps {
  children: ReactNode;
}

export const LoginGate = ({ children }: LoginGateProps): React.JSX.Element => {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [router, status]);

  if (status !== 'anonymous') {
    return (
      <Spinner
        aria-label={status === 'loading' ? 'Carregando login' : 'Redirecionando para seus treinos'}
      />
    );
  }

  return <>{children}</>;
};
