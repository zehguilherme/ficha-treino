'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, use, useSyncExternalStore, type ReactNode } from 'react';
import { getCurrentUser } from '@/lib/api';
import {
  clearSession,
  getServerSession,
  getSession,
  setSession,
  subscribeToSession,
} from '@/lib/auth';
import type { CurrentUser } from '@/schemas/api';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | undefined;
  isProfilePending: boolean;
  isProfileError: boolean;
  refetchProfile: () => Promise<void>;
  login: (token: string) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const login = (nextToken: string): void => {
  setSession(nextToken);
};

export const AuthProvider = ({ children }: AuthProviderProps): React.JSX.Element => {
  const queryClient = useQueryClient();
  const token = useSyncExternalStore(subscribeToSession, getSession, getServerSession);
  const profile = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    enabled: typeof token === 'string',
    retry: false,
  });
  const status: AuthStatus =
    token === undefined ? 'loading' : token === null ? 'anonymous' : 'authenticated';
  const refetchProfile = async (): Promise<void> => {
    await profile.refetch();
  };
  const logout = (): void => {
    clearSession();
    queryClient.clear();
  };

  return (
    <AuthContext
      value={{
        status,
        user: profile.data,
        isProfilePending: typeof token === 'string' && profile.isPending,
        isProfileError: typeof token === 'string' && profile.isError,
        refetchProfile,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
