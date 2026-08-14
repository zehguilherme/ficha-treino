'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';

interface LoginGateProps {
  children: ReactNode;
  navigate?: (url: string) => void;
}

const navigateToDashboard = (url: string): void => {
  window.location.replace(url);
};

export const LoginGate = ({
  children,
  navigate = navigateToDashboard,
}: LoginGateProps): React.JSX.Element => {
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') navigate('/dashboard');
  }, [navigate, status]);

  if (status !== 'anonymous') {
    return (
      <Spinner
        aria-label={status === 'loading' ? 'Carregando login' : 'Redirecionando para seus treinos'}
      />
    );
  }

  return <>{children}</>;
};
