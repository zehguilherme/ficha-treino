import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { useEffect, type ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { getCurrentUser } from '@/lib/api';
import { getSession, setSession } from '@/lib/auth';

jest.mock('@/lib/api', () => ({
  getCurrentUser: jest.fn(),
}));

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

interface WrapperProps {
  children: ReactNode;
}

const Wrapper = ({ children }: WrapperProps): React.JSX.Element => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

const AuthProbe = (): React.JSX.Element => {
  const { login, logout, status, user } = useAuth();
  return (
    <>
      <p>{status}</p>
      <p>{user?.name ?? 'sem perfil'}</p>
      <button type="button" onClick={() => login('new-token')}>
        Login
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </>
  );
};

interface LoginEffectProbeProps {
  onLoginChange: () => void;
}

const LoginEffectProbe = ({ onLoginChange }: LoginEffectProbeProps): React.JSX.Element => {
  const { login, status } = useAuth();

  useEffect(() => {
    onLoginChange();
  }, [login, onLoginChange]);

  return (
    <button type="button" onClick={() => login('new-token')}>
      {status}
    </button>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  /**
   * A persisted JWT exists while the profile endpoint is temporarily unavailable.
   * Mock: getCurrentUser rejects without a 401 response.
   * Assert: the session remains authenticated and exposes no fabricated profile.
   */
  test('keeps the session authenticated when the profile request fails', async () => {
    setSession('jwt-token');
    mockedGetCurrentUser.mockRejectedValue(new Error('network'));

    render(<AuthProbe />, { wrapper: Wrapper });

    expect(await screen.findByText('authenticated')).toBeInTheDocument();
    expect(screen.getByText('sem perfil')).toBeInTheDocument();
    expect(getSession()).toBe('jwt-token');
  });

  /**
   * A user starts anonymous and changes the session through the context API.
   * Mock: getCurrentUser resolves after login.
   * Assert: login and logout update rendered status and localStorage reactively.
   */
  test('updates consumers when login and logout change the session', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      name: 'João Teste',
      email: 'joao@teste.com',
    });
    render(<AuthProbe />, { wrapper: Wrapper });

    expect(await screen.findByText('anonymous')).toBeInTheDocument();
    act(() => screen.getByRole('button', { name: 'Login' }).click());
    expect(await screen.findByText('authenticated')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('João Teste')).toBeInTheDocument());
    expect(getSession()).toBe('new-token');

    act(() => screen.getByRole('button', { name: 'Logout' }).click());
    expect(await screen.findByText('anonymous')).toBeInTheDocument();
    expect(getSession()).toBeNull();
  });

  /**
   * A consumer depends on the login action while the session changes.
   * Mock: the profile request resolves after login.
   * Assert: changing the session does not notify the effect with a new login action.
   */
  test('keeps the login action stable when the session changes', async () => {
    const onLoginChange = jest.fn<void, []>();
    mockedGetCurrentUser.mockResolvedValue({
      name: 'João Teste',
      email: 'joao@teste.com',
    });
    render(<LoginEffectProbe onLoginChange={onLoginChange} />, { wrapper: Wrapper });

    await waitFor(() => expect(onLoginChange).toHaveBeenCalledTimes(1));
    act(() => screen.getByRole('button', { name: 'anonymous' }).click());
    expect(await screen.findByRole('button', { name: 'authenticated' })).toBeInTheDocument();
    expect(onLoginChange).toHaveBeenCalledTimes(1);
  });
});
